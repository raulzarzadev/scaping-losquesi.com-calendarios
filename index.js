//@ts-check
const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs-extra');
const writeStreamJSON = fs.createWriteStream('data.json');
const writeStreamCSV = fs.createWriteStream('data.csv');
const URL = 'https://losquesi.com/calendarios/calendario-de-aguas-abiertas/#aguas-abiertas-2022-05'

const monthNames = [
    "Enero", "Febrero", "Marzo",
    "Abril", "Mayo", "Junio", "Julio",
    "Agosto", "Septiembre", "Octubre",
    "Noviembre", "Diciembre"
]
async function init() {
    const $ = await request({
        uri: URL,
        transform: body => cheerio.load(body)
    })
    let response = {}

    response.title = $('title').text()
    response.calendars = []
    $('h2').each((i, el) => {
        const calendarName = $(el).text().trim()
  
        $(el).parent().parent().parent().find('.vc_tta-container').each((j, el) => {
            
            const calendar = {
                calendarName,
                events: [],
            }

            $(el).find('h4').each((k, el) => {
                const month = $(el).text()
                const monthIndex = monthNames.indexOf(month) + 1

                $(el).parent().parent().find('.vc_tta-panel-body').each((l, el) => {
                    $(el).find('p').each((m, el) => {
                        const eventNameHtml = $(el).html()
                        const rulers = eventNameHtml.includes('hb-moon-rulers') ? eventNameHtml.split('<br>').pop().replace(/( |<([^>]+)>)/ig, '').trim() : null
                        const rulersSplited = rulers ? rulers.split(/[y,]/g).join(', ') : null

                        const dates = $(el).find('strong').text().trim()
                        const date = dates.split(/[\s-]/g)[0]
                        const eventName = $(el).find('a').text().trim()
                        const reference = $(el).find('a').attr('href')
                        const year = calendarName.split(' ').pop()
                        const fullDate = `${year}-${monthIndex}-${date}`
                        const formatEvent = {
                            Nombre: eventName,
                            Date: fullDate,
                            Eventos: rulersSplited,
                            Referencia: reference
                        }
                        calendar.events.push(formatEvent)
                    })
                })

            })
            response.calendars.push(calendar)
        })
    })

    const stringify = JSON.stringify(response)
    writeStreamJSON.write(stringify)

}

init()