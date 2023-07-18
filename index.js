

// let checklist_ul
// let checklist_li_clone
// let checklist_li_add
// let currect_task = {}

const day_msecs = 24 * 3600000

let today = parseInt(Date.now() / day_msecs) * day_msecs + day_msecs
let yesterday = today - day_msecs
let tomorrow = today + day_msecs
let thisweek = today + 7 * day_msecs

let priorities = {
    '-': 0,
    'low': 1,
    'moderate': 2,
    'elevated': 3,
    'urgent' :4
}

let projects = ['-','home','family','work','health','growth','leisure']
let _projects = {
    _: { icon: '', text: 'unassigned' },
    home: { icon: 'apartment', text: 'unassigned' },
    family: { icon: 'family_restroom', text: 'unassigned' },
    work: { icon: 'work_history', text: 'unassigned' },
    health: { icon: 'health_metrics', text: 'unassigned' },
    growth: { icon: 'school', text: 'unassigned' },
    leisure: { icon: 'hiking', text: 'unassigned' },
    
}


jstr = (_in) => JSON.stringify(_in)
jpar = (_in) => JSON.parse(_in)
keys = (_in) => Object.keys(_in)
uuid = () => { 
    let url = (URL.createObjectURL(new Blob()))
    return url.substring(url.lastIndexOf('/') + 1)  
}

selector = (classes) => document.querySelector(classes) 
textContent = (elem, val) => elem.textContent = val


local_storage = () => {
    _storage = {}
    setItem = (key, val) =>  _storage[key] = val // JSON.stringify(val)
    getItem = (key) => _storage[key] //  JSON.parse(_storage[key] )
    clear = () => _storage = {}
    removeItem = (key) => delete _storage[key] 
    return { setItem, getItem, removeItem, clear }   
}

/* local_storage usage  
    (emulates browser localStorage on Node)
    localStorage = local_storage()
    localStorage.setItem('tasklist', jstr(tasklist))
    _ret = jpar(localStorage.getItem('tasklist'))
*/

// class
class Task  {
    constructor(description, date_create) {
        this.id = uuid()
        this.description = description
        this.project = ''
        this.priority = priorities[0]
        this.date_create = date_create || Date.now()
        this.date_due = -1
        this.date_done = -1
        this.note = ''
        this.checklist = []
        this.assign = -1
    } 
   _set = (obj) => {
       let _keys = keys(obj)
       _keys.forEach(key => {
           console.log(['set', key, obj[key]])
           this[key] = obj[key]
       })        
   }
   _description = (upd) => this.description = upd 
   _project = (upd) =>  this.project = upd
   _priority = (upd) => this.priority = upd
   _date_create = () => this.date_create
    //    _set_date_create = (upd) => this.date_create = upd
   _date_due = (upDate) => this.date_due = upDate
   _date_done = (done) => this.date_done = done || Date.now()
   _note = (upd) => this.note = upd
   _checklist = (upd) => this.checklist = upd
   // _assign = (upd) => this.assign = upd
   _dump = () => { return jpar(jstr(this)) }
   // _setid = (_id) => this.id = _id 
   _id = () => this.id // { return id }
   _subtask = (description) => {
    return { id: uuid(), status: false, subtask: description }
   }
   _checklist_add = (subtask) => {
    this.checklist.push(subtask)
   }
   _checklist_get_idx = (id) => {
    return this.checklist.findIndex(t => t.id === id)
   }
   _checklist_upd = (idx, subtask) => this.checklist[idx] = subtask
   _checlist_del = (idx) => this.checklist.splice(idx, 1)
}

/* Task usage - gen several tasks

    t1 = new Task('1st new task')
    t1._note('1st commentary')
    t1._date_due(t1._date_create() + 7 * 24*3600000)
    t1._project('work')
    _t1 = t1._dump()
    _t1s = jstr(_t1)

    t11 = new Task('2nd task', _t1.date_create)
    t11._date_create() == t1._date_create() 


    t2 = new Task('2nd task')
    t2._date_create() == t1._date_create() 
    t2._note('2nd commentary')
    t2c._date_due(Date.now() + 7 * 24*3600000)
    t2._project('home')
    t2._priority(3)


    _t1 = t1._dump()
    delete _t1.id
    delete _t1.description
    delete _t1.date_create
    _t1.project = 'event'
    _t1.priority = 5
    _t1.note = 'a note tate'
    _t1.checklist = ['1st subtask','2nd subtask', '3rd']
    _t1

    t3 = new Task('3rd task')
    t3._set(_t1)
    _t3 = t3._dump()


*/

class Tasks  {
    constructor() {
        this._tasklist = []
        this._projects = ['home','health','work','event','meeting' ]
    }
    _add = (todo) => this._tasklist.push(todo) // create
    _get = (id) => {  // read
       let idx = this._tasklist.findIndex(_t => _t.id === id)
       return this._tasklist[idx]
    }
    _upd = (todo) => { // update
         let idx = this._tasklist.findIndex(_t => _t.id === todo._id)
         this._tasklist[idx] = todo
    }
    _del = (id) => this._tasklist.splice(this._tasklist.find(_t => _t.id === id), 1) // delete

    // project categories identifiers crud
    _add_project = (project) => this._projects.push(project)
    _get_projects = () => this._projects.map(t => t ) 
    _upd_project = (project, upd) => this._projects[this._projects.findIndex(_p => _p === project)] = upd 
    _del_project = (project) => this._projects.splice(_projects.findIndex(_p => _p === project), 1) // delete

    // projects
    _dump = () => this._tasklist.map(task => task._dump())
    _filter = (field, val) => this._tasklist.filter(t => t[field] === val) 
    _sort = (field, dir) => { return (dir == 'asc' || dir == 'a' || dir == 'A' ? this._tasklist.sort((a, b) => a[field] - b[field]) : this._tasklist.sort((a, b) => b[field] - a[field]))}
    _import = (tasks) => {
        tasks.forEach(t => {
            let task = new Task(_t.description, _t.date_create)
            task._set(_t)
            this._add(task)
        })

    }
    // _save_store = (store) => this._tasklist.forEach(task => store.setItem(task.id, jstr(task._dump())))
    // _read_store = (store) => jpar(store.getItem('_tasklist'))

}

/* build tasklist and add tasks
    tasklist = new Tasks()
    tasklist._add(t1)
    tasklist._add(t2)
    tasklist._add(t3)
    tasklist._dump()

    tasklist._get_projects()
    tasklist._add_project('kids')
    tasklist._upd_project('kids', 'Andy')

    // dump the first tasklist and recreate from dump to
    // simulate save to storage and then rehydration from storage

    // dump and parse first tasklist
    _ = jstr(tasklist._dump())
    _tasks = jpar(_)

    // create a new 2nd tasklist and dupe /rehydrate the first into the second
    tasks2 = new Tasks()

    // repopulate 2nd tasklist
    _tasks.forEach(_t => {
        task = new Task(_t.description, _t.date_create)
        task._set(_t)
        tasks2._add(task)
    })

    // non exhaustive (but critical) checks on equality
    _t21 = tasks2._get(_tasks[1].id)
    _t21.date_create == _tasks[1].date_create

    _t20 = tasks2._get(_tasks[0].id)
    _t20.date_create == _tasks[0].date_create

    _t22 = tasks2._get(_tasks[2].id)
    _t22.date_create == _tasks[2].date_create

*/



class taskInterface {
    constructor() {
        this.projects = projects // ['home','family','work','leisure','health','growth']
        this.nodes = { }
        this.values = { }

        this.nodes.task_detail_container = selector('div.task_detail')
        this.nodes.task_list_container = selector('div.task_list')

        this.nodes.task_list = selector('ul.task_list')
        this.nodes.task_list_task_clone = this.nodes.task_list.querySelector('li.task')
        this.nodes.task_list.removeChild(this.nodes.task_list_task_clone)

        this.nodes.id = selector('input.id')
        this.nodes.description = selector('input.description')
        this.nodes.note = selector('input.note')
        // this.nodes.id = 
        this.nodes.project = selector('select.project')
        this.nodes.project_option = this.nodes.project.querySelector('option')
        this.nodes.project.removeChild(this.nodes.project_option)
        // set the list of project options
        this.projects.forEach(opt => {
            let opt_node = this.nodes.project_option.cloneNode(true)
            opt_node.value = opt
            opt_node.textContent = opt
            this.nodes.project.appendChild(opt_node)
        })

        this.nodes.priority = selector('select.priority')
        // this.nodes.date_create = selector('.date_create')
        
        this.nodes.date_due_label = selector('.date_due .label')
        this.nodes.date_due_label.addEventListener('click', evt => this.date_due(evt))
        
        this.nodes.date_due = selector('input.date_due')
        this.nodes.date_due.addEventListener('change', evt => this.date_due_change(evt))
        
        this.nodes.date_done_label = selector('.date_done .label')
        this.nodes.date_done_label.addEventListener('click', evt => this.date_done(evt))

        this.nodes.date_done = selector('input.date_done')
        this.nodes.date_done.addEventListener('change', evt => this.date_done_change(evt))
        

        this.nodes.checklist = selector('ul.checklist')
        
        this.nodes.checklist_li_clone = selector('li.checklist').cloneNode(true)

        this.nodes.checklist.removeChild(selector('li.checklist'))
        this.nodes.checklist_add = selector('.checklist_add')
        this.nodes.checklist_add.addEventListener('click', (evt) => {
            let clone = this.nodes.checklist_li_clone.cloneNode(true)
            let id = uuid()
            this.values.checklist.push({ id: id, status: false, subtask: '' })
            clone.setAttribute('data-id', id)
            clone.querySelector('input.subtask').addEventListener('change', evt => this.checklist_li_change(evt))
            clone.querySelector('span.done').addEventListener('click', evt => this.checklist_li_done(evt))
            clone.querySelector('span.del').addEventListener('click', evt => this.checklist_li_del(evt))
            this.nodes.checklist.appendChild(clone)  
        })
        
        // project group sidebar
        this.nodes.projects_grp = selector('ul.projects')
        this.nodes.projects_grp_li_clone = this.nodes.projects_grp.querySelector('li')
        this.nodes.projects_grp.removeChild(this.nodes.projects_grp_li_clone)
        keys(_projects).forEach(prj => {
            let clone = this.nodes.projects_grp_li_clone.cloneNode(true)
            clone.querySelector('span.material-symbols-outlined').textContent = prj == '_' ? 'warning' :  _projects[prj].icon
            clone.querySelector('span.label').textContent = prj == '_' ? 'unassigned' : prj // _projects[prj].text
            this.nodes.projects_grp.appendChild(clone)
        })

        // this.nodes.projects_add = selector('div.addProject')
        // this.nodes.projects_add.addEventListener('click', (evt) => {
        //     res = prompt('')
        // })

        //this.nodes.assign = selector('.assign')

        /*
            nodes.description    onchange this.values.description = evt.target.value -- description, note, date_create
            nodes.note           onchange this.values.note = evt.target.value
            nodes.project        onchange --> this.values.project = this.nodes.project.value
            nodes.priority       onchange --> this.values.priority = priorities[this.nodes.priority.value]
            nodes.date_due       onchange --> this.values.date_due = this.nodes.date_due.valueAsNumber
            nodes.date_done      onchange --> { 
                this.values.date_done = this.nodes.date_done.valueAsNumber
                nodes.date_done_label.classlist.replace('viz', 'xviz')        
            }

            nodes.date_done_label    onclick  --> this.values.date_done = Date.now() 
            nodes.date_done_label    ondblclick  --> {
                nodes.date_done_label.classList.replace('viz', 'xviz')        
                this.nodes.date_done.classList.replace('xviz','viz')
            }                

        nodes.checklist_add  onclick --> {
            checklist_ul.appendChild(checklist_li_clone.cloneNode(true)   
        }
        
        
        
        
        
        
        */
    }
    date_due = (evt) => {
        if (this.nodes.date_due.classList[1] == 'xviz') {
            this.nodes.date_due.classList.replace('xviz', 'viz')
        } else {
            this.nodes.date_due.classList.replace('viz', 'xviz')
        }
    }
    date_due_change = (evt) => {
        this.nodes.date_due_label.textContent = evt.target.value
        this.nodes.date_due.classList.replace('viz', 'xviz')
        this.values.date_due = evt.target.valueAsNumber
    }
    date_done = (evt) => {
        if (this.nodes.date_done.classList[1] == 'xviz') {
            this.nodes.date_done.classList.replace('xviz', 'viz')
        } else {
            this.nodes.date_done.classList.replace('viz', 'xviz')
        }
        if (this.values.date_done === -1) { // set it as todays date
            this.nodes.date_done.valueAsNumber = Date.now()
        }
    }
    date_done_change = (evt) => {
        this.nodes.date_done_label.textContent = evt.target.value
        this.nodes.date_done.classList.replace('viz', 'xviz')

        this.values.date_done = evt.target.valueAsNumber
    }

    checklist_li_done = (evt) => {
        let parent = evt.target.parentNode
        let li_id = parent.getAttribute('data-id')
        evt.target.textContent = evt.target.textContent == 'check_box' ? 'check_box_outline_blank' : 'check_box'
        this.values.checklist.find(item => item.id === li_id).status = evt.target.textContent == 'check_box' ? true : false
    }

    checklist_li_del = (evt) => {
        let parent = evt.target.parentNode
        let li_id = parent.getAttribute('data-id')
        // evt.target.textContent = evt.target.textContent == 'check_box' ? 'check_box_outline_blank' : 'check_box'
        this.values.checklist.splice(this.values.checklist.findIndex(item => item.id === li_id), 1)
        this.nodes.checklist.removeChild(selector('[data-id="'+ li_id +'"]'))
    }
    checklist_li_change = (evt) => {
        let parent = evt.target.parentNode
        let li_id = parent.getAttribute('data-id')
        let _ = this.values.checklist.find(item => item.id === li_id)
        _.subtask = evt.target.value
    }

    set_fields(task) {
        let _task =task._dump()
        let _keys = keys(_task)
        this.values = {}
        this.nodes.checklist.querySelectorAll('li').forEach(_li => this.nodes.checklist.removeChild(_li))
        _keys.forEach(_k => {
            if (_task[_k] instanceof Array) {
                // iterate thru checklist
                if (!this.values[_k]) { this.values[_k] = [] }
                _task[_k].forEach(item => {
                    this.values[_k].push(item)
                    let clone = this.nodes.checklist_li_clone.cloneNode(true)
                    clone.setAttribute('data-id', item.id)
                    clone.querySelector('span.done').textContent = item.status ? 'check_box' : 'check_box_outline_blank'
                    clone.querySelector('input').value = item.subtask 

                    clone.querySelector('input.subtask').addEventListener('change', evt => this.checklist_li_change(evt))
                    clone.querySelector('span.done').addEventListener('click', evt => this.checklist_li_done(evt))
                    clone.querySelector('span.del').addEventListener('click', evt => this.checklist_li_del(evt))

                    this.nodes.checklist.appendChild(clone)                           
                })
            } else {
                if (!this.values[_k]) { this.values[_k] = _task[_k] }
                // set values directly
                if (this.nodes[_k] && this.nodes[_k].type == 'text') {
                    this.nodes[_k].value = _task[_k]
                } else if (this.nodes[_k] && this.nodes[_k].type == 'select-one') {
                    this.nodes[_k].value = _task[_k]
                } else if (this.nodes[_k] && this.nodes[_k].type == 'date') {
                    this.nodes[_k].valueAsNumber = _task[_k]
                    // itask.nodes['date_due' + '_label'].textContent = new Date(itask.values['date_due']).toLocaleDateString() 
                    this.nodes[_k + '_label'].textContent = _task[_k] == -1 ? 'not set' : new Date(_task[_k]).toLocaleDateString()
                }
            }
        })
    }

    // item: json task 
    tasklist_item = (item) => {
        let clone = this.nodes.task_list_task_clone.cloneNode(true)
        clone.setAttribute('data-id', item.id)
        let priority = '-'
        let project = '-'
        switch (item.priority) {
            case 'urgent':
            case 'elevated':
                priority = 'priority_high';
                break;
            case 'moderate':
                priority = 'priority'
                break;
            default:
                priority = 'low_priority'
        }
        switch (item.project) {
            case 'home':
                project = 'home';
                break;
            case 'work':
                project = 'apartment'
                break;
            case 'health':
                project = 'ecg'
                break;
            case 'growth':
                project = 'school'
                break;
            case 'family':
                project = 'family_restroom'
                break;
            case 'leisure':
                project = 'hiking';
                break;
            default:
                project = ''
        }
        clone.querySelector('span.priority').textContent = priority  
        clone.querySelector('span.project').textContent = project
        clone.querySelector('span.date_due').textContent = new Date(item.date_due).toLocaleDateString()
        clone.querySelector('span.description').textContent = item.description 
        // this.nodes.task_list.appendChild(clone)
        return clone
    }
    tasklist_all(list) { // default dump all and list <-- sort and group !!!!
        list._dump().forEach(item => {
            // let clone = this.nodes.task_list_task_clone.cloneNode(true)
            // clone.setAttribute('data-id', item.id)
            // let priority = '-'
            // let project = '-'

            // switch (item.priority) {
            //     case 'urgent':
            //     case 'elevated':
            //         priority = 'priority_high';
            //         break;
            //     case 'moderate':
            //         priority = 'priority'
            //         break;
            //     default:
            //         priority = 'low_priority'
            // }

            // switch (item.project) {
            //     case 'home':
            //         project = 'home';
            //         break;
            //     case 'work':
            //         project = 'apartment'
            //         break;
            //     case 'health':
            //         project = 'ecg'
            //         break;
            //     case 'growth':
            //         project = 'school'
            //         break;
            //     case 'family':
            //         project = 'family_restroom'
            //         break;
            //     case 'leisure':
            //         project = 'hiking';
            //         break;
            //     default:
            //         project = ''
            // }
            // clone.querySelector('span.priority').textContent = priority  
            // clone.querySelector('span.project').textContent = project
            // clone.querySelector('span.date_due').textContent = new Date(item.date_due).toLocaleDateString()
            // clone.querySelector('span.description').textContent = item.description 
            let clone = this.tasklist_item(item)
            this.nodes.task_list.appendChild(clone)
        })

    } 
}


function page_config() {


}

    // execute 
    page_config()

    lorem = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio quidem, corrupti placeat dolor obcaecati quasi laudantium saepe sit, quos perferendis est similique necessitatibus numquam quisquam autem mollitia reiciendis! Rem, illum! Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vel quibusdam, consequatur animi minus eius debitis obcaecati earum sapiente impedit, magnam labore molestias tempore non? Culpa voluptatibus voluptas provident adipisci nulla. Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam, minus harum molestiae velit sapiente odit consequuntur odio dolorum? Inventore consectetur accusamus error eveniet fugiat cupiditate, repudiandae culpa maxime pariatur aperiam."
    tasklist = new Tasks()
    for (n = 0; n< 12; n++) {
        _t = new Task(n + ' auto gen new task')
        _t._note(`${n} ${lorem.substring(parseInt(n * Math.random() * 15), 14)}`)
        _t._date_due(Date.now() + ((Math.random() * 24) * day_msecs - (12 * day_msecs)))
        _t._priority( keys(priorities)[parseInt(Math.random() * 4)])
        _t._project( projects[parseInt(Math.random() * projects.length)])
        tasklist._add(_t)
    }




let itask = new taskInterface()
// itask.set_fields(tasklist._tasklist[3])

itask.tasklist_all(tasklist)

/*

_tasks = tasklist._dump()
tasks_for = {
  	overdue: _tasks.filter(_t =>  _t.date_due < yesterday ), 
    today: _tasks.filter(_t =>  _t.date_due > yesterday &&  _t.date_due < today ),
    tomorrow: _tasks.filter(_t =>  _t.date_due > today && _t.date_due > tomorrow ),
    thisweek: _tasks.filter(_t =>  _t.date_due < thisweek ),
  	distant:  _tasks.filter(_t =>  _t.date_due > thisweek )
}


by_priority = (a, b) => priorities[a.priority] > priorities[b.priority]

tasks_for.overdue.sort((a,b) => )

// display tasks
itask._







let priorities = {
    '-': 0,
    'low': 1,
    'moderate': 2,
    'elevated': 3,
    'urgent' :4
}

*/















    
/*

// atask = {
//     "priorities": [
//       "high",
//       "medium",
//       "low",
//       "none"
//     ],
//     "id": "T_1689628114359",
//     "description": "1st new task",
//     "project": "work",
//     "priority": "none",
//     "date_create": 1689628114359,
//     "date_due": 1690232914359,
//     "date_done": -1,
//     "note": "1st commentary",
//     "checklist": [
//       {
//         "id": "262c834d-8aff-4f64-9ec9-b8a583690de4",
//         "status": false,
//         "subtask": "1st subtask"
//       },
//       {
//         "id": "f163a2f5-6d4a-4fba-a8f6-f098c0d5e445",
//         "status": true,
//         "subtask": "2nd subtask"
//       },
//       {
//         "id": "ba9a8529-da4c-475b-bcda-9d4fd044e1d1",
//         "status": false,
//         "subtask": "3rd subtask"
//       }
//     ],
//     "assign": -1
//   }


//    tasklist = new Tasks()
//     tasklist._add(t1)
//     tasklist._add(t2)


// task = tasklist._get(_t1.id)
// _task = task._dump()


// sample data to populate 
    t1 = new Task('1st new task')
    t1._note('1st commentary')
    t1._date_due(t1._date_create() + 7 * 24*3600000)
    t1._project('work')

    t1.checklist = [
    { id: uuid(), status: false, subtask: '1st subtask'},
    { id: uuid(), status: true, subtask: '2nd subtask'},
    { id: uuid(), status: false, subtask: '3rd subtask'}
    ]
    _t1 = t1._dump()


    // populate the task detail


    // selector('.task_detail').setAttribute('data-id', t1.id)
    // selector('.task_detail').getAttribute('data-id')

    task_id = selector('.task_detail')
    task_id.setAttribute('data-id', t1.id)
    task_id_val = task_id.getAttribute('data-id')

    textContent(selector('.description .label'), t1.description )
    textContent(selector('.note .label'), t1.note)
    textContent(selector('.priority .label'), t1.priority)
    textContent(selector('.project .label'), t1.project)
    t1.checklist.forEach(t => {
        li = checklist_li_clone.cloneNode(true)
        li.querySelector('.label').textContent = t.subtask
        console.log(li.innerHTML)
        checklist_ul.appendChild(li)  
    })
    
    // textContent(selector('.date_due .label'), t1.date_due)  // convert date to something usefull/intelligeable
    // selector('.date_due .label')

    date_due = selector('input.date_due')
    date_due.valueAsNumber = t1.date_due

    date_done = selector('.date_done')    // .value = '2023-06-31'
    date_done.addEventListener('click', (evt) => {
        t = tasklist._get(task_id_val)
    t._date_done(Date.now())
    
    })



    // get a cloned li node & remove 1st/only unlabeled 
    checklist_li_clone = selector('.checklist_li').cloneNode(true)
    checklist_ul = selector('.checklist_ul')
    checklist_ul.removeChild(selector('.checklist_li'))



    function populate_task_detail (task) {
        currect_task = task._dump()
        task_id = selector('.task_detail')
        task_id.setAttribute('data-id', task.id)
        // task_id_val = task_id.getAttribute('data-id')
    
        // set basic text fields
        desc = selector('.description .label')
        // desc.addEventListener('blur',(evt) => {
        //     field = evt.target.classList[0]
        //     if (evt.target.textContent !== current_task[field] )
        // })


//         desc = selector('.description .label')
//         // .label')
// desc.textContent


// desc.addEventListener('blur', (evt) => {   
// field = 'description'
// if (evt.target.textContent !== current_task[field] ) {
// console.log('changed')
// } else {
// console.log('same')
// }

// })



        textContent(desc, task.description )

        textContent(selector('.note .label'), task.note)
        textContent(selector('.priority .label'), task.priority)
        textContent(selector('.project .label'), task.project)


        // build the tasklist
        task.checklist.forEach(t => {
            li = checklist_li_clone.cloneNode(true)
            li.querySelector('.label').textContent = t.subtask
            // console.log(li.innerHTML)
            li.setAttribute('data-id', t.id)
            li.querySelector('.checklist_done').addEventListener('click', (evt) => {
                idx = task.checklist.findIndex(st => st.id === t.id)
                // set the corresponding checklist item status (done/not done)
                task.checklist[idx].status = !task.checklist[idx].status
                // toggle icon or colours or both
                evt.target.textContent = task.checklist[idx].status ? 'check_box' : 'disabled_by_default'    
            })
            li.querySelector('.checklist_del').addEventListener('click', (evt) => {
                idx = task.checklist.findIndex(st => st.id === t.id)
                console.log([t.id, idx])
                // get idx and trash it
                task.checklist.splice(idx, 1) 
                checklist_ul.removeChild(selector('[data-id="' + t.id + '"'))
            })

            checklist_ul.appendChild(li) 
        })
        
        // textContent(selector('.date_due .label'), t1.date_due)  // convert date to something usefull/intelligeable
        // selector('.date_due .label')

        // 1st pass use input/date control
        date_due = selector('input.date_due')
        date_due.valueAsNumber = task.date_due
    
        // set event to mark task as done
        // should have validation to check all checklist subtasks are complete
        date_done = selector('.date_done')    // .value = '2023-06-31'
        date_done.addEventListener('click', (evt) => {
            t = tasklist._get(task.id)
            t._date_done(Date.now())
        })
    
    
    
    
    

    }    


    // t1 = new Task('1st new task')
    // t1._note('1st commentary')
    // t1._date_due(t1._date_create() + 7 * 24*3600000)
    // t1._project('work')
    // t1._priority('moderate')

    // t1.checklist = [
    // { id: uuid(), status: false, subtask: '1st subtask'},
    // { id: uuid(), status: true, subtask: '2nd subtask'},
    // { id: uuid(), status: false, subtask: '3rd subtask'}
    // ]
    // _t1 = t1._dump()

    // t2 = new Task('2nd new task')
    // t2._note('2nd commentary')
    // t2._date_due(t2._date_create() + 3 * 24*3600000)
    // t2._project('home')

    // t2.checklist = [
    //     { id: uuid(), status: false, subtask: '1st subtask'},
    // ]
    // _t2 = t2._dump()

    // t3 = new Task('2nd new task')
    // t3._note('2nd commentary')
    // t3._date_due(t2._date_create() + 3 * 24*3600000)
    // t2._project('home')

    // t2.checklist = [
    //     { id: uuid(), status: false, subtask: '1st subtask'},
    // ]
    // _t2 = t2._dump()

*/













