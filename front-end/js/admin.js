const endpoint = 'http://localhost:9080/comp4537/api/v1/'
const mc_enum = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D'
}
const quiz_container = document.getElementById('list');
const new_question_div = document.getElementById('new_question')
const new_question_form = document.getElementById('new_question_form')
const selection_div = document.getElementById('selection')

const xhttp = new XMLHttpRequest();
let request = endpoint + "questions/"
xhttp.open('GET', request, true)
xhttp.send()
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        let questions = []
        data.forEach(element => {
            if (questions[element.qid] == null) {
                questions[element.qid] = []
            }
            questions[element.qid].push(element)
        })

        questions.forEach(question => {
            let q = buildQuestion(question)
            quiz_container.append(q)
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

    let delete_button = document.createElement('button')
    delete_button.classList.add('ui', 'button', 'icon', 'red', 'right', 'floated')
    delete_button.onclick = () => {
        deleteQuestion(question[0].qid)
    }
    let close_icon = document.createElement('i')
    close_icon.classList.add('close', 'icon')

    delete_button.appendChild(close_icon)

    header_div.append(header)
    header_div.append(delete_button)

    let form_div = document.createElement('div')
    form_div.classList.add('ui', 'form')

    // Create Text Area Field
    let ta_field = document.createElement('div')
    ta_field.classList.add('field')
    let ta = document.createElement('textarea')
    ta.value = question[0].q_content ? question[0].q_content : ""
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
    radio_input.checked = (index) == question[index].answer
    let radio_label = document.createElement('label')
    radio_label.innerText = mc_enum[index]
    let answer_input = document.createElement('input')
    answer_input.type = 'text'
    answer_input.value = question[index].a_content ? question[index].a_content : ''
    answer_input.dataset.id = id

    radio_div.appendChild(radio_input)
    radio_div.appendChild(radio_label)
    field_div.appendChild(radio_div)
    field_div.appendChild(answer_input)

    return field_div
}

function deleteQuestion(id) {
    deleteQuestionfromDB(id)
    let question_div = document.getElementById(`q${id}`)
    question_div.remove()
}

let new_question_button = document.getElementById('new_question_button');
let save_button = document.getElementById('save_button');

new_question_button.onclick = () => {
    new_question_div.classList.remove('hide')
    selection_div.classList.add('hide')
    let count = 1;
    quiz_container.childNodes.forEach(child => {
        count++
    })
    var a_count = 0
    while (a_count < 2 || a_count > 4) {
        a_count = prompt("How many answers? (2-4)");
    }
    let empty_question = []

    for (let i = 0; i < a_count; i++) {
        empty_question.push({
            qid: count,
            aid: i
        })
    }
    let q = buildQuestion(empty_question)
    new_question_form.innerHTML = '';
    new_question_form.append(q);
}

const add_question_button = document.getElementById('add_question_button');
const cancel_button = document.getElementById('cancel_button');

add_question_button.onclick = () => {
    let ta = new_question_form.getElementsByTagName("textarea")
    let inputs = [...new_question_form.getElementsByTagName('input')]
    let text_inputs = inputs.filter(input => input.type == 'text')
    let radio_inputs = inputs.filter(input => input.type == 'radio')
    let correct_answer = -1
    for (let i = 0; i < radio_inputs.length; i++) {
        if (radio_inputs[i].checked) {
            correct_answer = i
            break;
        }
    }
    if (correct_answer == -1) {
        alert('A correct answer must be selected')
        return;
    } else if (ta[0].value == '') {
        alert('Question must contain something')
        return;
    }

    let question_div = new_question_form.getElementsByClassName('question')[0]
    let qid = question_div.id.match(/\d+/)[0]
    let question = {
        qid: qid,
        q_content: ta[0].value,
        answer: correct_answer
    }
    let answers = text_inputs.map(ans => ({
        qid: qid,
        a_content: ans.value,
        aid: ans.dataset.id
    }))
    
    // POST
    addQuestiontoDB(question)
    addAnswerstoDB(answers)

    new_question_form.innerHTML = '';
    new_question_div.classList.add('hide')
    selection_div.classList.remove('hide')
    window.location.reload();
}

function addQuestiontoDB(data) {
    let request = endpoint + "questions/"
    xhttp.open('POST', request, true)
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(data))
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('success questions')
        }
    }
}

function addAnswerstoDB(data) {
    let request = endpoint + "answers/"
    xhttp.open('POST', request, true)
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(data))
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('success answers')
        }
    }
}

function deleteQuestionfromDB(id) {
    let request = endpoint + "questions/"
    xhttp.open('DELETE', request, true)
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(id))
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('successful deletion')
        }
    }
}

function updateQuestions(data) {
    let request = endpoint + "questions/"
    xhttp.open('PUT', request, true)
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(data))
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('successful update')
        }
    }
}

save_button.onclick = () => {
    // grab all questions and data
    let questions = quiz_container.childNodes;
    // create objects
    let questions_data = []
    for (let i = 0; i < questions.length; i++) {
        let question = questions[i]
        let qid = question.id.match(/\d+/)[0]
        let question_form = question.getElementsByClassName('ui form')[0]

        let ta = question_form.getElementsByTagName("textarea")
        let inputs = [...question_form.getElementsByTagName('input')]
        let text_inputs = inputs.filter(input => input.type == 'text')
        let radio_inputs = inputs.filter(input => input.type == 'radio')
        let correct_answer = -1
        for (let i = 0; i < radio_inputs.length; i++) {
            if (radio_inputs[i].checked) {
                correct_answer = i
                break;
            }
        }
        let question_obj = {
            qid: qid,
            q_content: ta[0].value,
            answer: correct_answer
        }
        let answers = text_inputs.map(ans => ({
            qid: qid,
            a_content: ans.value,
            aid: ans.dataset.id
        }))
        let group = [question_obj, answers]
        questions_data.push(group)
    }
    console.log(questions_data)
    // send request
    updateQuestions(questions_data)
    // notify
    let notifier = document.getElementById('save_message')
    notifier.classList.remove('hidden')
    setTimeout(() => {
        notifier.classList.add('hidden')
    }, 3000)
}

cancel_button.onclick = () => {
    new_question_form.innerHTML = '';
    new_question_div.classList.add('hide')
    selection_div.classList.remove('hide')
}