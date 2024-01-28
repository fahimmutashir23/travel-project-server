module.exports = ({name}) => {
    const today = new Date()
    return `
    <!doctype html>
    <html?>
    <head>
    <meta charset="utf-8">
    <title> Invoice </title>
    </head>
    <body>
    <h1> ${name} </h1>
    </body>
    </html?>
    `
}