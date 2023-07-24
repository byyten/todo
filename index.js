



const day_msecs = 24 * 3600000

let today = parseInt(Date.now() / day_msecs) * day_msecs + day_msecs
let yesterday = today - day_msecs
let tomorrow = today + day_msecs
let thisweek = today + 7 * day_msecs


let priorities = {
    urgent: { icon: 'priority_high', text: 'urgent' },
    high: { icon: 'priority_high', text: 'high' },
    medium: { icon: 'priority', text: 'medium' },
    low: { icon: 'low_priority', text: 'low' },
    none: { icon: 'low_priority', text: 'none' },
}

let projects = {
    unassigned: { icon: 'warning', text: 'unassigned' },
    home: { icon: 'home', text: 'home' },
    family: { icon: 'family_restroom', text: 'family' },
    work: { icon: 'apartment', text: 'work' },
    health: { icon: 'health_metrics', text: 'health' },
    growth: { icon: 'school', text: 'growth' },
    leisure: { icon: 'hiking', text: 'leisure' }, 
}

let _tasks = []
let _completed = []


jstr = (_in) => JSON.stringify(_in)
jpar = (_in) => JSON.parse(_in)
keys = (_in) => Object.keys(_in)
uuid = () => { 
    let url = (URL.createObjectURL(new Blob()))
    return url.substring(url.lastIndexOf('/') + 1)  
}

selector = (classes) => document.querySelector(classes) 
textContent = (elem, val) => elem.textContent = val

// sorts
sort_priority = (a, b) => priorities[a.priority] < priorities[b.priority] // highest first (descending) if ascending [].reverse()
sort_project = (a, b) => a.project < b.project
sort_date = (a, b) => a.date_due < b.date_due


// groupings
by_overdue = (_t) => _t.date_due < yesterday
by_today = (_t) =>  _t.date_due > yesterday &&  _t.date_due < today
by_tomorrow = (_t) =>  _t.date_due > today && _t.date_due < tomorrow 
by_thisweek = (_t) =>  _t.date_due > today && _t.date_due < thisweek 
by_future = (_t) =>  _t.date_due > thisweek
//
by_priority = (_t) => _t.priority === _priority
by_project = (_t) => _t.project === _project
by_all = (_t) => _t

local_save = () => {
    localStorage.setItem('_tasks', jstr(_tasks))
    localStorage.setItem('_completed', jstr(_completed))
}

// faking localStorage in node
// local_storage = () => {
//     _storage = {}
//     setItem = (key, val) =>  _storage[key] = val // JSON.stringify(val)
//     getItem = (key) => _storage[key] //  JSON.parse(_storage[key] )
//     clear = () => _storage = {}
//     removeItem = (key) => delete _storage[key] 
//     return { setItem, getItem, removeItem, clear }   
// }


// class
class Task  {
    constructor(description, date_create) {
        this.id = uuid()
        this.description = description
        this.project = projects.unassigned.text
        this.priority = priorities.none.text
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

class Tasks  {
    constructor() {
        this._list = []
    }
    _add = (todo) => this._list.push(todo) // create
    _get = (id) => {  // read
       let idx = this._list.findIndex(_t => _t.id === id)
       return this._list[idx]
    }
    _upd = (todo) => { // update
         let idx = this._list.findIndex(_t => _t.id === todo._id)
         this._list[idx] = todo
    }
    // _del = (id) => this._list.splice(this._list.find(_t => _t.id === id), 1) // delete
    _del = (idx) => this._list.splice(idx, 1) // delete

    // _dump = () =>  this._list.map(task => task._dump())
    _dump = () =>  this._list
            .filter(_t => !(_t.description === '' && _t.date_due === -1 &&  _t.project == 'unassigned' && _t.priority == 'none'))
            .map(task => task._dump())
    
    _filter = (field, val) => this._list.filter(t => t[field] === val) 
    _sort = (field, dir) => { return (dir == 'asc' || dir == 'a' || dir == 'A' ? this._list.sort((a, b) => a[field] - b[field]) : this._list.sort((a, b) => b[field] - a[field]))}
    _import = (tasks) => {
        tasks.forEach(t => {
            let task = new Task(_t.description, _t.date_create)
            task._set(_t)
            this._add(task)
        })

    }
    // _save_store = (store) => this._list.forEach(task => store.setItem(task.id, jstr(task._dump())))
    // _read_store = (store) => jpar(store.getItem('_list'))
}

class taskInterface {
    constructor() {
        this.projects = projects
        this.priorities = priorities

        this.nodes = { }
        this.values = { }

        this.nodes.task_detail_container = selector('div.task_detail')
        let inputs = Array.from(this.nodes.task_detail_container.querySelectorAll('input, select')).slice(0,7)
        inputs.forEach(_in => _in.addEventListener('change', (evt) => this.task_change(evt)))

        this.nodes.task_list_container = selector('div.task_list')

        this.nodes.task_list = selector('ul.task_list')
        this.nodes.task_list_task_clone = this.nodes.task_list.querySelector('li.task')
        
        this.nodes.task_list.removeChild(this.nodes.task_list_task_clone)

        this.nodes.task_list_seperator_clone = this.nodes.task_list.querySelector('li.seperator')
        this.nodes.task_list.removeChild(this.nodes.task_list_seperator_clone)

        this.nodes.id = selector('input.id')
        this.nodes.description = selector('input.description')
        this.nodes.note = selector('input.note')
        // this.nodes.id = 
        this.nodes.project = selector('select.project')
        this.nodes.project_option = this.nodes.project.querySelector('option')
        this.nodes.project.removeChild(this.nodes.project_option)
        // set the list of project options
        keys(this.projects).forEach(opt => {
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
        // this.nodes.date_due_mark_done = selector('span.mark_done')

        this.nodes.date_done_label = selector('.date_done .label')
        this.nodes.date_done_label.addEventListener('click', evt => this.date_done(evt))

        this.nodes.date_done = selector('input.date_done')
        this.nodes.date_done.addEventListener('change', evt => this.date_done_change(evt))
        
        this.nodes.checklist = selector('ul.checklist')        
        this.nodes.checklist_li_clone = selector('li.checklist').cloneNode(true)

        this.nodes.checklist.removeChild(selector('li.checklist'))
        this.nodes.checklist_add = selector('.checklist_add')
        this.nodes.checklist_add.addEventListener('click', evt => this.checklist_add_item(evt))
        
        // project group sidebar
        this.nodes.projects_grp = selector('ul.projects')
        this.nodes.projects_grp_li_clone = this.nodes.projects_grp.querySelector('li')
        this.nodes.projects_grp.removeChild(this.nodes.projects_grp_li_clone)
        keys(projects).forEach(prj => {
            let clone = this.nodes.projects_grp_li_clone.cloneNode(true)
            clone.querySelector('span.material-symbols-outlined').textContent = prj == '_' ? 'warning' :  projects[prj].icon
            clone.querySelector('span.label').textContent = prj == '_' ? 'unassigned' : prj // projects[prj].text
            let _filter
            switch (prj) {
                case 'unassigned': _filter = (_t) => _t.project == 'unassigned'; break;
                case 'home': _filter = (_t) => _t.project == 'home'; break;
                case 'work': _filter = (_t) => _t.project == 'work'; break;
                case 'family': _filter = (_t) => _t.project == 'family'; break;
                case 'health': _filter = (_t) => _t.project == 'health'; break;
                case 'growth': _filter = (_t) => _t.project == 'growth'; break;
                case 'leisure': _filter = (_t) => _t.project == 'leisure'; break;
            }
            clone.addEventListener('click', (evt) => this.list(_filter, projects[prj].icon, prj, true, false))
            this.nodes.projects_grp.appendChild(clone)
        })

        // search nodes
        this.nodes.search_all = selector('div.searches .all')
        this.nodes.search_all.addEventListener('click', (evt) => this.list(by_all, priorities, 'By Priority', true, true))

        this.nodes.search_overdue = selector('div.searches .overdue')
        this.nodes.search_overdue.addEventListener('click', (evt) => this.list(by_overdue, 'history', 'Overdue', true, true))

        this.nodes.search_today = selector('div.searches .today')
        this.nodes.search_today.addEventListener('click', (evt) => this.list(by_today, 'today', 'Today', true, true))

        this.nodes.search_tomorrow = selector('div.searches .tomorrow')
        this.nodes.search_tomorrow.addEventListener('click', (evt) => this.list(by_tomorrow, 'event', 'Tomorrow', true, true))

        this.nodes.search_thisweek = selector('div.searches .thisweek')
        this.nodes.search_thisweek.addEventListener('click', (evt) => this.list(by_thisweek, 'view_week', 'This week', true, true))

        this.nodes.search_future = selector('div.searches .future')
        this.nodes.search_future.addEventListener('click', (evt) => this.list(by_future, 'calendar_month', 'After this week', true, true))

        this.nodes.addtask = selector('.addTask')
        this.nodes.addtask.addEventListener('click', evt => this.task_new(evt) )
    }
    list_seperator = (icon, label) => {
        let clone = this.nodes.task_list_seperator_clone.cloneNode(true)
        clone.querySelector('span.seperator').textContent = icon
        clone.querySelector('span.label').textContent = label
        return clone
    }
    list = (_filter, icon, label, pri, proj) => {
        // hide away task detail 
        //this.nodes.task_list_container.classList.replace('xviz','viz')
        this.nodes.task_detail_container.classList.replace('viz', 'xviz')
        // filter the data using a given filter function
        let _dset = _tasks.filter(_filter)  // _filter == e.g: _t =>  _t.date_due < yesterday )
        this.clear_tasklist()

        // set a heading
        selector('div.task_list span.title').textContent = 'Pending actions: ' + label

        // get the priority groups 
        let _priorities = keys(priorities) // Array.from(new Set(_dset.map(_t => _t.priority)))
        _priorities.forEach(_pri => {
            // filter again for each priority
            let _sdset = _dset.filter(_t => _t.priority === _pri)
            if (_sdset.length > 0) {
                // add a separator to the listing
                let clone = this.list_seperator(priorities[_pri].icon, _pri)
                this.nodes.task_list.appendChild(clone)

                // iter each in group
                _sdset.forEach(task => {
                    let clone = this.tasklist_task(task, false, proj)
                    clone.classList.add('addleftmargin')
                    clone.addEventListener('click', (evt) => this.list_item_detail(evt))
                    this.nodes.task_list.appendChild(clone)
                })
            }
        })
    }
    delete_task = (evt) => {
        let idx = _tasks.findIndex(_t => _t.id === evt.target.parentNode.getAttribute('data-id'))
        tasks._del(idx)
        _tasks = tasks._dump()
        local_save()
        this.nodes.task_detail_container.classList.replace('viz', 'xviz')
        this.nodes.task_list.removeChild(evt.target.parentNode)
        evt.preventDefault()
    }

    date_due = (evt) => {
        if (this.nodes.date_due.classList[1] == 'xviz') {
            this.nodes.date_due.classList.replace('xviz', 'viz')
        } else {
            this.nodes.date_due.classList.replace('viz', 'xviz')
        }
    }
    date_due_change = (evt) => {
        this.nodes.date_due_label.textContent = new Date(evt.target.value).toLocaleDateString()
        this.nodes.date_due.classList.replace('viz', 'xviz')

        let li_id = evt.target.getAttribute('data-id')
        let field = evt.target.classList[0]
        let task = tasks._list.find(_tsk => _tsk.id === li_id)
        
        this.values[field] = evt.target.type === 'date' ? evt.target.valueAsNumber : evt.target.value
        task[field] = evt.target.type === 'date' ? evt.target.valueAsNumber : evt.target.value
        _tasks[_tasks.findIndex(_t => _t.id === li_id)] = task._dump()

        // this.values.date_due = evt.target.valueAsNumber
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
        let datedone = evt.target.valueAsNumber
        let inconsistent = false
        // validation
        if (datedone > Date.now()) { 
            inconsistent = true 
            let resp = confirm('Inconsistent dates:\nCompleted date is in the future\nOK to proceed with future date (logical inconsistent)\nCancel to alter date')
            if (!resp) {
                return
            } 
        } 
        
        // date is ok - but checks to make sure not before created should be done
            this.nodes.date_done_label.textContent = new Date(datedone).toLocaleDateString()

            let li_id = evt.target.getAttribute('data-id')
            let field = evt.target.classList[0]
            let idx = tasks._list.findIndex(_tsk => _tsk.id === li_id)
            // set date_done value of the current selected task, the task (class) and then dump to json
            this.values[field] = datedone 
            tasks._list[idx][field] = datedone 

            // splice out the completed task and push to archive
            let completed = tasks._list.splice(idx, 1)[0]
            _completed.push(completed._dump()) // storage to archival
            // update _tasks
            _tasks = tasks._dump()
            local_save()
            // reset the detail form to normal
            this.nodes.date_done.classList.replace('viz', 'xviz')
            this.nodes.task_detail_container.classList.replace('viz', 'xviz')
                        
            let li_tasks = Array.from(this.nodes.task_list.querySelectorAll('li.task'))
            let done_task_idx = li_tasks.findIndex(li => li.getAttribute('data-id') === li_id)
            let li_task = li_tasks[done_task_idx]
            
            li_task.querySelector('div').style.backgroundColor = 'transparent'
            li_task.querySelector('span.date_due')
            // to avoid possible deletion
            li_task.querySelector('div.del').classList.add('xviz')

            li_task.querySelector('span.date_due').textContent = 'Completed'
            li_task.querySelector('span.date_due').style.color = 'green'

            li_task.querySelector('span.description').style.color = 'green'

    } 
    checklist_li_done = (evt) => {
        let parent = evt.target.parentNode
        let li_id = parent.getAttribute('data-id')
        let task_id = parent.getAttribute('data-task_id')
        let status  = evt.target.textContent == 'check_box' ? false : true; // toggles: status is opposite of clicked state 
        let checklist_idx = this.values.checklist.findIndex(item => item.id === li_id)

        evt.target.textContent = status ? 'check_box' : 'check_box_outline_blank';
        this.values.checklist[checklist_idx].status = status

        let task = tasks._list.find(_tsk => _tsk.id === task_id)
        task.checklist[checklist_idx].status = status; 
        _tasks[_tasks.findIndex(_t => _t.id === task_id)] = task._dump()

    }
    checklist_li_del = (evt) => {
        let parent = evt.target.parentNode
        let li_id = parent.getAttribute('data-id')
        let task_id = parent.getAttribute('data-task_id')
        let checklist_idx = this.values.checklist.findIndex(item => item.id === li_id)

        this.values.checklist.splice(checklist_idx, 1)
        this.nodes.checklist.removeChild(selector('[data-id="'+ li_id +'"]'))

        let task = tasks._list.find(_tsk => _tsk.id === task_id)
        task.checklist.splice(checklist_idx, 1)
        _tasks[_tasks.findIndex(_t => _t.id === task_id)] = task._dump()

    }
    checklist_li_change = (evt) => {
        let parent = evt.target.parentNode
        let li_id = parent.getAttribute('data-id')
        let task_id = parent.getAttribute('data-task_id')
        let checklist_item = this.values.checklist.find(item => item.id === li_id)
        checklist_item.subtask = evt.target.value;

        let task = tasks._list.find(_tsk => _tsk.id === task_id)
        let checklist_idx = task.checklist.findIndex(item => item.id == li_id)
        
        task.checklist[checklist_idx].subtask = evt.target.value
        
        _tasks[_tasks.findIndex(_t => _t.id === li_id)] = task._dump()

    }
    checklist_add_item = (evt) => {
        let clone = this.nodes.checklist_li_clone.cloneNode(true)
        let li_id = uuid()
        let subtask = { id: li_id, status: false, subtask: '' }
        let task_id = this.nodes.checklist.getAttribute('data-task_id')

        this.values.checklist.push(subtask)
        let task_idx = tasks._list.findIndex(_tsk => _tsk.id === task_id)
        let task = tasks._list[task_idx]

        task._checklist_add({id: li_id, status: false, subtask: ''})
        
        _tasks[task_idx] = task._dump()

        clone.setAttribute('data-id', li_id)
        clone.setAttribute('data-task_id', task_id)

        clone.querySelector('input.subtask').addEventListener('change', evt => this.checklist_li_change(evt))
        clone.querySelector('span.done').addEventListener('click', evt => this.checklist_li_done(evt))
        clone.querySelector('span.del').addEventListener('click', evt => this.checklist_li_del(evt))

        this.nodes.checklist.appendChild(clone)  

    }
    task_change = (evt) => {
        //let parent = evt.target.parentNode
        let li_id = evt.target.getAttribute('data-id')
        let field = evt.target.classList[0]
        let task = tasks._list.find(_tsk => _tsk.id === li_id)
        if (field === 'priority') { evt.target.previousElementSibling.textContent = priorities[evt.target.value].icon }
        if (field === 'project') { evt.target.previousElementSibling.textContent = projects[evt.target.value].icon }
        this.values[field] = evt.target.type === 'date' ? evt.target.valueAsNumber : evt.target.value
        task[field] = evt.target.type === 'date' ? evt.target.valueAsNumber : evt.target.value
        // task['_' + field]( evt.target.type === 'date' ? evt.target.valueAsNumber : evt.target.value)
        let idx = _tasks.findIndex(_t => _t.id === li_id)
        _tasks[idx] = task._dump()
        
    }
    task_new = () => {
        // this.nodes.task_list.classList.add('xviz')
        let desc = prompt('Provide a brief , succinct task description')
        if (desc === null) { return }
        let _blank = new Task(desc);
        // this.nodes.task_list_container.classList.replace('viz','xviz')
        this.values = _blank._dump();
        this.set_fields(_blank._dump())
        tasks._add(_blank)
        _tasks = tasks._dump()
        local_save()
    }
    list_item_detail = (evt) => {
        try {
            this.nodes.task_list.querySelectorAll('li.task').forEach(li => li.querySelector('div').classList.remove('highlight'))
            console.log(evt)
            console.log(evt.target)
            evt.target.parentNode.classList.add('highlight')
            let id = evt.target.parentNode.parentNode.getAttribute('data-id')
            let _t = _tasks.find(tsk => tsk.id == id)
            console.log([id, _t])
            this.set_fields(_t)    
        } catch (e) { 
            // caused by delete of list item node
        }
    }

    set_fields(_task) {
        try {
            this.values = {}
            this.nodes.task_detail_container.classList.replace('xviz', 'viz')
            let _keys = keys(_task)
            this.nodes.checklist.querySelectorAll('li').forEach(_li => this.nodes.checklist.removeChild(_li))
            this.nodes.checklist.setAttribute('data-task_id', _task.id )
            _keys.forEach(_k => {
                if (_task[_k] instanceof Array) { // if the checklist
                    // iterate thru checklist
                    if (!this.values[_k]) { this.values[_k] = [] }
                    _task[_k].forEach(item => {
                        this.values[_k].push(item)
                        let clone = this.nodes.checklist_li_clone.cloneNode(true)
                        clone.setAttribute('data-id', item.id)
                        clone.setAttribute('data-task_id', _task.id )
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
                    if (this.nodes[_k] && this.nodes[_k].type === 'text') {
                        this.nodes[_k].value = _task[_k]
                        this.nodes[_k].setAttribute('data-id', _task.id)
                        // this.nodes[_k].addEventListener('change', (evt) => this.task_change(evt))


                    } else if (this.nodes[_k] && this.nodes[_k].type === 'select-one') {
                        this.nodes[_k].value = _task[_k]
                        this.nodes[_k].setAttribute('data-id', _task.id)
                        // this.nodes[_k].addEventListener('change', (evt) => this.task_change(evt))
                        if (this.nodes[_k].classList[0] === 'priority') { this.nodes[_k].previousElementSibling.textContent = priorities[_task[_k]].icon }
                        if (this.nodes[_k].classList[0] === 'project') { this.nodes[_k].previousElementSibling.textContent = projects[_task[_k]].icon }
                    } else if (this.nodes[_k] && this.nodes[_k].type === 'date') {
                        if (!(_task[_k] == '' || _task[_k] == -1) ) {
                            this.nodes[_k].valueAsNumber = _task[_k]
                            this.nodes[_k].setAttribute('data-id', _task.id)
                            this.nodes[_k + '_label'].setAttribute('data-id', _task.id)
                            // this.nodes[_k].addEventListener('change', (evt) => this.task_change(evt))
                            this.nodes[_k + '_label'].textContent = new Date(_task[_k]).toLocaleDateString() // _task[_k] == -1 ? 'not set' : 
                        } else {
                            this.nodes[_k].setAttribute('data-id', _task.id)
                            this.nodes[_k + '_label'].setAttribute('data-id', _task.id)
                            this.nodes[_k + '_label'].textContent = '- date not set'
                        }
                        
                    }
                }
            })
        } catch (e) {
            console.log(_task)
            console.log(keys(_task))                        
        }
    }

    // _task: json task 
    tasklist_task = (_task, pri, proj) => {
        let clone = this.nodes.task_list_task_clone.cloneNode(true)
        clone.setAttribute('data-id', _task.id)
        let li_content = clone.querySelector('div')
        let project = '-'
        if (pri) {
            li_content.querySelector('span.priority').textContent = priorities[_task.priority].icon // priority  
        } else {
            li_content.removeChild(li_content.querySelector('span.priority'))
        }
        if (proj) {
            switch (_task.project) {
                case 'unassigned':
                    project = 'remove';
                    break;
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
	        li_content.querySelector('span.project').textContent = project  
        } else {

            li_content.removeChild(li_content.querySelector('div span.project'))
        }


        // clone.querySelector('span.project').textContent = project
        let dt = parseInt(Date.now()  / day_msecs + day_msecs)
        let dt_diff = parseInt(_task.date_due / day_msecs + day_msecs)  - dt  
        let text;
        let bkcolor = '';

        if (dt_diff < -1) {
            text = `Overdue ${dt_diff * -1} days`;
            bkcolor = 'rgb(252, 125, 144)';
        } else if (dt_diff == -1) {
            text = `Overdue ${dt_diff * -1} day`;
            bkcolor = 'rgb(252, 125, 144)';
        } else if (dt_diff == 0) {
            text = `Due today`;
        } else if (dt_diff > 1) {
            text = `${dt_diff} days`;
        } else if (dt_diff == 1){
            text = `tomorrow`;
        }
    
        li_content.querySelector('span.date_due').textContent = text   // dt_diff > 0 ? 'Due in ' + dt_diff + ' days' : 'Overdue ' + dt_diff * -1 + ' days' // new Date(_task.date_due).toLocaleDateString()
        if (bkcolor !== '') { li_content.style.color = bkcolor }
        li_content.querySelector('span.description').textContent = _task.description 
        


        li_content.addEventListener('click', evt => this.list_item_detail(evt))
        clone.querySelector('div.del').addEventListener('click', evt => this.delete_task(evt))
        return clone
    }
    clear_tasklist () {
        this.nodes.task_list.querySelectorAll('li').forEach(li => this.nodes.task_list.removeChild(li))
    }
}


// returns JSON object _tasks
// use to generate debug data
// _tasks = fake_tasks()
let fake_tasks = (tasks, ntasks ) => {
    lorem = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio quidem, corrupti placeat dolor obcaecati quasi laudantium saepe sit, quos perferendis est similique necessitatibus numquam quisquam autem mollitia reiciendis! Rem, illum! Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vel quibusdam, consequatur animi minus eius debitis obcaecati earum sapiente impedit, magnam labore molestias tempore non? Culpa voluptatibus voluptas provident adipisci nulla. Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam, minus harum molestiae velit sapiente odit consequuntur odio dolorum? Inventore consectetur accusamus error eveniet fugiat cupiditate, repudiandae culpa maxime pariatur aperiam."
    projkeys = keys(projects)
    
    for (n = 0; n < ntasks; n++) {
        _t = new Task(n + ' auto gen new task')
        _t._note(`${n} ${lorem.substring(parseInt(n * Math.random() * 15), 14)}`)
        _t._date_due(parseInt(Date.now() + ((Math.random() * 24) * day_msecs - (12 * day_msecs))))
        _t._priority( keys(priorities)[parseInt(Math.random() * 4)])
        _t._project( projkeys[parseInt(Math.random() * projkeys.length)])
        M = parseInt(Math.random() * 5)
        for (m = 0; m < M; m++) {
            _t.checklist.push({ id: uuid(), status: false, subtask: lorem.substring(parseInt(m * Math.random() * 15), 14)})
        }
        tasks._add(_t)
    }
    return tasks
}

// typical usage, recover tasks from localstorage
//      using fake_tasks will probably overwrite localstorage copies 
//      so disable local_save after each tasks._dump()
let itask = new taskInterface()
let tasks = new Tasks()
_tasks = []
try {
    _tasks = jpar(localStorage.getItem('_tasks'))
    _tasks.forEach(_task => {
        let T = new Task(_task.description)
        T._set(_task)
        tasks._add(T)
    })    
    _completed = jpar(localStorage.getItem('_completed'))
} catch (e) {
    _tasks = []
}
