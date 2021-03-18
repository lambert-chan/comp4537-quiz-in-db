let http = require('http')
let mysql = require('mysql')
const urlParser = require('url')
const endpoint = "/comp4537/api/v1/"
const GET = 'GET';
const PUT = 'PUT';
const OPTIONS = 'OPTIONS';
const DELETE = 'DELETE';
const POST = 'POST';

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webdev'
})

con.connect(err => {
    if (err) throw err
    console.log('Connected!')
})

http.createServer((req, res) => {
    var body = ''
    if (req.url !== '/favicon.ico') {

        res.writeHead(200, {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        })

        req.on('error', (err) => {
            console.error(err.stack);
        })

        if (req.method == POST) {
            if (req.url == (endpoint + 'questions/')) {
                console.log('post question')
                req.on('data', data => {
                    let question = JSON.parse(data);
                    let sql = `INSERT INTO questions(qid, q_content, answer)
                    VALUES (${question.qid}, "${question.q_content}", ${question.answer})
                    `;
                    con.query(sql, function (err, result, fields) {
                        if (err) throw err
                        res.end(JSON.stringify(result))
                    })
                })
            } else if (req.url == (endpoint + 'answers/')) {
                console.log('post answers')
                req.on('data', data => {
                    let answers = JSON.parse(data);
                    let values = ''
                    answers.forEach(ans => {
                        values += `${values == '' ? '' : ','}(${ans.qid}, "${ans.a_content}")`
                    })
                    let sql = `INSERT INTO answers(qid, a_content)
                    VALUES${values}`
                    con.query(sql, function (err, result, fields) {
                        if (err) throw err
                        res.end(JSON.stringify(result))
                    })
                })
            } else {
                res.end('Fail Post')
            }
        } else if (req.method == DELETE) {
            if (req.url == (endpoint + 'questions/')) {
                req.on('data', data => {
                    let qid = JSON.parse(data);
                    let sql_a = `DELETE FROM answers WHERE qid = ${qid}`
                    con.query(sql_a, function (err, result, fields) {
                        if (err) throw err
                    })
                    let sql_q = `DELETE FROM questions WHERE qid = ${qid}`
                    con.query(sql_q, function (err, result, fields) {
                        if (err) throw err
                        res.end(JSON.stringify(result))
                    })
                })
            }
        } else if (req.method == PUT) {
            if (req.url == (endpoint + 'questions/')) {
                req.on('data', data => {
                    let question_data = JSON.parse(data);
                    question_data.forEach(group => {
                        let q_obj = group[0]
                        let a_arr = group[1]
                        let sql_q = `UPDATE questions 
                        SET q_content = '${q_obj.q_content}',answer = ${q_obj.answer}
                        WHERE qid = ${q_obj.qid};`
                        con.query(sql_q, function (err, result, fields) {
                            if (err) throw err
                        })
                        a_arr.forEach(ans => {
                            let sql = `UPDATE answers 
                            SET a_content = '${ans.a_content}'
                            WHERE qid = ${ans.qid} AND aid = ${ans.aid}`
                            con.query(sql, function (err, result, fields) {
                                if (err) throw err
                            })
                        })
                    })
                    res.end("Update complete")
                })
            }
        } else if (req.method === GET && req.url === (endpoint + 'questions/')) {
            let sql = `SELECT * FROM questions INNER JOIN answers ON questions.qid=answers.qid`
            con.query(sql, function (err, result, fields) {
                if (err) throw err
                res.end(JSON.stringify(result))
            })
        } else {
            res.end('Hello ' + body)
        }
    }
}).listen(9080);