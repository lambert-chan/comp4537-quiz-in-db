const endpoint = 'http://localhost:9080/comp4537/api/v1/'
const mc_enum = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D'
}
const quiz_container = document.getElementById('list');
const submit_button = document.getElementById('submit_button');
var answer_key = []

const xhttp = new XMLHttpRequest();
let request = endpoint + "questions/"
xhttp.open('GET', request, true)
xhttp.send()
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        let questions = []
        data.forEach(element => {
            if (questions[element.qid] == null) {
                questions[element.qid] = []
            }
            questions[element.qid].push(element)
        })
        if (questions.length == 0) {
            let header = document.createElement('h3')
            header.textContent = "Sorry, there are no questions."
            submit_button.classList.add('hide')
            quiz_container.append(header)
            return
        }
        questions.forEach(question => {
            let q = buildQuestion(question)
            answer_key.push(question[0].answer)
            quiz_container.append(q)
            submit_button.classList.remove('hide')
        })
    }
}

function buildQuestion(question) {
    let question_div = document.createElement('div')
    question_div.classList.add('question')
    question_div.id = `q${question[0].qid}`
    let header_div = document.createElement('div')
    let header = document.createElement('h2')
    header.innerText = `Question ${question[0].qid}`

    header_div.append(header)

    let form_div = document.createElement('div')
    form_div.classList.add('ui', 'form')

    // Create Text Area Field
    let ta_field = document.createElement('div')
    ta_field.classList.add('field')
    let ta = document.createElement('textarea')
    ta.value = question[0].q_content ? question[0].q_content : ""
    ta.disabled = true
    ta_field.append(ta)

    // Create answer container
    let group_field = document.createElement('div')
    group_field.classList.add('grouped', 'fields')
    let answer_label = document.createElement('label')
    answer_label.innerText = 'Answers:'

    group_field.append(answer_label)

    for (let i = 0; i < question.length; i++) {
        let field = createField(i, question, question[i].aid)
        group_field.append(field)
    }

    form_div.append(ta_field)
    form_div.append(group_field)

    question_div.append(header_div)
    question_div.append(form_div)

    return question_div
}

function createField(index, question, id) {
    let field_div = document.createElement('div')
    field_div.classList.add('field')
    let radio_div = document.createElement('div')
    radio_div.classList.add('ui', 'radio', 'checkbox')
    let radio_input = document.createElement('input')
    radio_input.type = 'radio'
    radio_input.name = `quiz_question${question[index].qid}`

    let radio_label = document.createElement('label')
    radio_label.innerText = mc_enum[index]
    let answer_input = document.createElement('input')
    answer_input.type = 'text'
    answer_input.value = question[index].a_content ? question[index].a_content : ''
    answer_input.disabled = true

    radio_div.appendChild(radio_input)
    radio_div.appendChild(radio_label)
    field_div.appendChild(radio_div)
    field_div.appendChild(answer_input)

    return field_div
}

submit_button.onclick = () => {
    let submitted_answers = []
    let questions = quiz_container.childNodes;
    for (let i = 0; i < questions.length; i++) {
        let question = questions[i]
        let question_form = question.getElementsByClassName('ui form')[0]

        let inputs = [...question_form.getElementsByTagName('input')]
        let radio_inputs = inputs.filter(input => input.type == 'radio')
        let selected_answer = -1
        for (let i = 0; i < radio_inputs.length; i++) {
            if (radio_inputs[i].checked) {
                selected_answer = i
                break;
            }
        }
        if (selected_answer == -1) {
            alert('All questions must be answered')
            return;
        }
        submitted_answers.push(selected_answer)
    }

    //compare with key
    let correct = 0
    for (let i = 0; i < answer_key.length; i++) {
        if (answer_key[i] == submitted_answers[i]) {
            correct++
        }
    }
    let score = correct/answer_key.length * 100
    // console.log(score.toFixed(0))
    alert(`You got ${score.toFixed(0)}%`)
}