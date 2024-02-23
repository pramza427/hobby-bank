'use client'
import { randomInt } from 'crypto';
import Image from 'next/image';
import { useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { Tooltip } from 'react-tooltip';
import { useClickAway } from '@uidotdev/usehooks';

function convertTime(days: number, hours: number, minutes: number, seconds: number) {
    var h = hours < 10 ? "0" + hours : hours;
    var m = minutes < 10 ? "0" + minutes : minutes;
    var s = seconds < 10 ? "0" + seconds : seconds
    if (days > 0) { return days + ":" + h + ":" + m + ":" + s }
    else { return h + ":" + m + ":" + s }
    
}

function convertTotalTime(totalTime: number) {
    var days = Math.floor(totalTime / 86400)
    var hours = Math.floor(totalTime / 3600 % 24)
    var minutes = Math.floor(totalTime % 3600 / 60)
    var seconds = Math.floor(totalTime % 60)
    return convertTime(days, hours, minutes, seconds)
}

function calculateTotalExpenses(project: object) {
    var expensesCost = project?.expenses?.reduce((total, expense) => total + expense.cost, 0);
    return expensesCost = expensesCost ?? 0;
}

function calculateBankAfterExpenses(project: object, totalSeconds: number) {
    var rateTime = totalSeconds / 3600 * project.price
    var expensesCost = calculateTotalExpenses(project);

    return (rateTime - expensesCost).toFixed(2)
}

const saveFile = async (blob) => {
    const a = document.createElement('a');
    a.download = 'hobbie-list.txt';
    a.href = URL.createObjectURL(blob);
    a.addEventListener('click', (e) => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
};

function loadFile(setHobbies: Function) {
    var fr;

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        var file = e.target.files[0];

        if (!input.files[0]) {
            alert("Please select a file before clicking 'Load'");
        }
        else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);
        }

        function receivedText(e) {
            let lines = e.target.result;
            var newArr = JSON.parse(lines);
            setHobbies(newArr);
        }
    }

    input.click();

   
}

export default function Home() {
    
    const [currentHobbieID, setcurrentHobbieID] = useState(0);
    const [currentProjectID, setcurrentProjectID] = useState(0);
    const [hobbies, setHobbies] = useState([]);
    

    function getcurrentHobbieID() {
        return hobbies.find(hobbie => hobbie.id == currentHobbieID)
    }

    return (
        <main className="flex min-h-screen text-sm md:text-lg overflow-hidden">
            <HobbieList allHobbies={hobbies} setHobbies={setHobbies} currentHobbieID={currentHobbieID} setcurrentHobbieID={setcurrentHobbieID} />
            <ProjectList allHobbies={hobbies} setHobbies={setHobbies} currentProjectID={currentProjectID} setcurrentProjectID={setcurrentProjectID} getHobbie={getcurrentHobbieID} />

        </main>
    )
}

function HobbieButton({ currentHobbieID, setcurrentHobbieID, hobbie, allHobbies, setHobbies }) {
    function clickHandle() {
        setcurrentHobbieID(hobbie.id)
    }
    function deleteHobbie(event) {
        event.stopPropagation()
        if (window.confirm("Delete " + hobbie.title + "?")) {
            let filteredHobbies = allHobbies.filter((h: any) => h.id != hobbie.id);
            setHobbies(filteredHobbies);
            window.localStorage.setItem("hobbies", JSON.stringify(filteredHobbies));
        }
    }
    const totalTime = hobbie.projects.reduce((total, project) => total + project.time, 0)
    const isSelected = (currentHobbieID == hobbie.id) ? " bg-violet-900 bg-opacity-100 " : " hover:bg-metal "
    return (
        <div className={"group p-1 rounded hover:cursor-pointer " + isSelected}
            onClick={clickHandle} >
            <div>{hobbie.title}</div>
            <div className="flex justify-between w-full">
                <div className="hidden group-hover:block hover:bg-red-900 rounded px-2" onClick={deleteHobbie}>DEL</div>
                <div className="text-right flex-grow">{convertTotalTime(totalTime)}</div>
            </div>
            
        </div>
    )
}

function HobbieList({ allHobbies, setHobbies, currentHobbieID, setcurrentHobbieID }) { 
    const [addingHobbie, setAddingHobbie] = useState(false);
    const [showHobbies, setShowHobbies] = useState(true);

    const closeHobbiesRef = useClickAway(() => {
        if (window.innerWidth < 768) {
            setShowHobbies(false);
        }
    });

    function saveToFile() {
        const blob = new Blob([JSON.stringify(allHobbies, null, 2)], { type: 'application/json' });
        saveFile(blob);
    }
    function toggleAddingHobbie() {
        setAddingHobbie(!addingHobbie);
    }
    let hobbieList;
    if (allHobbies.length != 0) {
        hobbieList = allHobbies.map(hobbie =>
            <div className="border-b border-violet-900"
                key={hobbie.id}>
                <HobbieButton currentHobbieID={currentHobbieID} setcurrentHobbieID={setcurrentHobbieID} hobbie={hobbie} allHobbies={allHobbies} setHobbies={setHobbies} />
            </div>)
    }
    else {
        <div/>
    }
    function getHobbiesFromLocal() {
        var hobbies = JSON.parse(window.localStorage.getItem("hobbies")) ?? []
        setHobbies(hobbies);
        if (hobbies) {
            setcurrentHobbieID(hobbies[0].id);
        }
        
    }

    let hobbieForm = addingHobbie ? <AddHobbie toggleAddingHobbie={toggleAddingHobbie} currentHobbieID={currentHobbieID} allHobbies={allHobbies} setHobbies={setHobbies} /> : <div />

    if (showHobbies) {
        return (
            <div className="absolute h-full w-2/3 z-10 p-2 rounded-r md:relative md:h-auto md:w-1/4 md:m-2 border border-violet-900 bg-violet-950 md:bg-opacity-70 flex flex-col md:rounded"
                onClick={(event) => event.stopPropagation()}
                ref={closeHobbiesRef}>
                <div className="flex">
                    <div className="p-2 px-4 inline-block rounded hover:bg-metal hover:cursor-pointer text-center"
                        onClick={() => setShowHobbies(false)} >
                        {"<"}
                    </div>
                    <div className="p-2 flex-grow rounded text-center hover:bg-metal hover:cursor-pointer"
                        onClick={toggleAddingHobbie}>
                        Add a Hobbie
                    </div>
                </div>
                <div className="border-b border-violet-900 mt-2 mb-2"></div>
                {hobbieForm}
                <div className="flex flex-col">
                    {hobbieList}
                </div>
                <div className="flex-grow border-b border-violet-900 mb-2"></div>
                <div className="mx-1 p-1 hover:cursor-pointer hover:bg-metal rounded flex justify-between "
                    onClick={getHobbiesFromLocal}>
                    Load from Local
                    <div className=" px-4" id="local-warning">
                        i
                    </div>
                    <Tooltip anchorSelect="#local-warning" >
                        <div className="z-50">
                            Changes will be automatically saved to local, but data can be lost if cache is cleared.
                        </div>
                    </Tooltip>
                </div>
                <div className="mx-1 p-1 hover:cursor-pointer hover:bg-metal rounded"
                    onClick={saveToFile}>
                    Save to File
                </div>
                <div className="mx-1 p-1 hover:cursor-pointer hover:bg-metal rounded"
                    onClick={() => loadFile(setHobbies)}>
                    Load From File
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="w-10 border-violet-900 bg-violet-950 md:bg-opacity-50"
                onClick={() => setShowHobbies(true)}>
                <div className="[writing-mode:vertical-lr] p-2">Hobbies</div>
            </div>
        )
    }
    
}

function AddHobbie({ toggleAddingHobbie, currentHobbieID, allHobbies, setHobbies }) {
    function submitNewHobbie(formData: object) {
        let newHobbie = {
            title: formData.get("name"),
            id: Math.floor(Math.random() * 1000),
            projects: []
        }
        allHobbies.unshift(newHobbie)
        setHobbies(allHobbies)
        toggleAddingHobbie()
    }

    return (
        <div className="bg-emerald-950 border border-emerald-800 rounded mb-2"
        onClick={toggleAddingHobbie }
        >
            <div onClick={event => event.stopPropagation()}
                className="p-2 inline-block ">
                <form action={submitNewHobbie} autoComplete="off">
                    <div>
                        <div>
                            Name of Hobbie
                        </div>
                        <input className="bg-teal-900 border border-teal-800 active:border-blue-900" name="name" required></input>
                    </div>

                    <button type="button" className="m-3 p-1 rounded hover:bg-metal" onClick={toggleAddingHobbie} >Cancel</button>
                    <button type="submit" className="m-3 p-1 rounded hover:bg-metal">Confirm</button>
                </form>
            </div>
            
        </div>
    )
}

function ProjectDetails({ allHobbies, project, isRunning, startTiming, stopTiming, totalSeconds, setEditing, showExpenses, setShowExpenses }) {

    function toggleExpenses() {
        setShowExpenses(!showExpenses)
    }
    function toggleTimer() {
        if (isRunning) {
            stopTiming();
            project.time = totalSeconds;
            window.localStorage.setItem("hobbies", JSON.stringify(allHobbies));
        }
        else {
            startTiming();
        }
    }
    var timerText = isRunning ? "Stop Timer" : "Start Timer"
    if (isRunning) {
        return (
            <div className="relative flex justify-center">
                
                <div className="mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={toggleTimer}>
                    {timerText}
                </div>
                <div className="absolute right-0 mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={toggleExpenses}>
                    {showExpenses ? "<- Expenses" : "Expenses ->"}</div>
            </div>
        )
    }
    else {
        return (
            <div className="relative flex justify-center">
                <div className="absolute left-0 mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={() => setEditing(true)}>
                    Edit
                </div>
                <div className="mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={toggleTimer}>
                    {timerText}
                </div>
                <div className="absolute right-0 mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={toggleExpenses}>
                    {showExpenses ? "<- Expenses" : "Expenses ->"}</div>
            </div>
        )
    }
    
}

function ProjectItem({ allHobbies, setcurrentProjectID, project, currentProjectID, deleteProject, showExpenses, setShowExpenses }) {
    const stopwatchOffset = new Date();
    stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + project.time ?? 0)
    const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        reset,
    } = useStopwatch({ autoStart: false, offsetTimestamp: stopwatchOffset });

    const [editing, setEditing] = useState(false);    
    
    function setProject() {
        setcurrentProjectID(project.id);
    }
    function editProject(formData) {
        setEditing(false);
        project.title = formData.get("title") ?? project.title;
        project.price = parseFloat(formData.get("rate")) ?? project.price;
        var newTime = parseInt(formData.get("days")) * 86400 + parseInt(formData.get("hours")) * 3600 + parseInt(formData.get("minutes")) * 60 + parseInt(formData.get("seconds"))
        const stopwatchOffset = new Date();
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + newTime ?? 0)
        reset(stopwatchOffset, false);
        project.time = newTime;
    }

    function deleteProjectView() {
        deleteProject(project.id);
        
        var elem = document.getElementById(project.id);
        var listElem = document.getElementById("projectList")
        project = {};
        console.log(elem);
        setEditing(false);
        setcurrentProjectID(null);
        
    }
    const handleFocus = (event: any) => event.target.select();
    const editingRef = useClickAway(() => {
        setEditing(false);
    });

    const iscurrentProjectID = project.id == currentProjectID;
    let selectedClass;
    let lowerSection;
    let timingClass = "";
    if (iscurrentProjectID) {
        lowerSection = <ProjectDetails allHobbies={allHobbies} project={project} isRunning={isRunning} startTiming={start} stopTiming={pause} totalSeconds={totalSeconds} setEditing={setEditing} showExpenses={showExpenses}  setShowExpenses={setShowExpenses} />
        selectedClass = "bg-violet-950 "
    }
    else {
        lowerSection = <div></div>
        selectedClass = "hover:bg-metal "
    }
    { isRunning ? timingClass = " timing " : "" }

    if (editing) {
        return (
            <div className="p-2 bg-violet-950" ref={editingRef }>
                <form action={editProject}>
                    <div className="grid grid-cols-4">
                        <input className="bg-slate-800 border border-gray-700" name="title" defaultValue={project.title} onClick={handleFocus}></input>
                        <div className="flex justify-end">
                            $
                            <input className="bg-slate-800 border border-gray-700 text-right w-16" name="rate" defaultValue={parseFloat(project.price).toFixed(2)} onClick={handleFocus}></input>
                        </div>
                        <div className="flex justify-end">
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="days" defaultValue={parseInt(days)} onClick={handleFocus}></input>
                            :
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="hours" defaultValue={parseInt(hours)} onClick={handleFocus}></input>
                            :
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="minutes" defaultValue={parseInt(minutes)} onClick={handleFocus}></input>
                            :
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="seconds" defaultValue={parseInt(seconds)} onClick={handleFocus}></input>
                        </div>
                        <div className="text-right">{"$" + calculateBankAfterExpenses(project, totalSeconds)}</div>
                    </div>
                    <div className="flex justify-center">
                        <button className="m-3 p-2 rounded hover:bg-red-800 hover:cursor-pointer" type="button" onClick={deleteProjectView}>
                            Delete
                        </button>
                        <button className="m-3 p-2 rounded hover:bg-green-800 hover:cursor-pointer " type="submit">
                            Done
                        </button>
                        <button className="m-3 p-2 rounded hover:bg-metal hover:cursor-pointer " type="button" onClick={() => setEditing(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
                
            </div>
        )
    }
    else {
        return (
            <div className={"relative p-2 hover:cursor-pointer " + selectedClass + timingClass}
                onClick={setProject}>
                <div className="grid grid-cols-4">
                    <div className="">{project.title}</div>
                    <div className="text-right">${parseFloat(project.price).toFixed(2)}</div>
                    <div className="text-right">{convertTime(days, hours, minutes, seconds)}</div>
                    <div className="text-right">{"$" + calculateBankAfterExpenses(project, totalSeconds)}</div>
                </div>
                {lowerSection}
            </div>

        )
    }
}

function ProjectList({ allHobbies, setHobbies, currentProjectID, setcurrentProjectID, getHobbie }) {
    const [addingProject, setAddingProject] = useState(false);
    const [showExpenses, setShowExpenses] = useState(false);

    function toggleAddingProject() {
        setAddingProject(!addingProject);
        setcurrentProjectID(null);
    }
    
    const currentHobbieID = getHobbie();
    function deleteProject(id) {
        currentHobbieID.projects = currentHobbieID.projects.filter(project => project.id != id)
    }
    let projectList;
    if (currentHobbieID != null) {
        projectList = currentHobbieID.projects.map(project =>
            <div
                key={project.id}
                id={project.id}
                className="even:bg-violet-950 even:bg-opacity-30"
            >
                <ProjectItem allHobbies={allHobbies} setcurrentProjectID={setcurrentProjectID} project={project} currentProjectID={currentProjectID} deleteProject={deleteProject} showExpenses={showExpenses} setShowExpenses={setShowExpenses} />
            </div>)
    }
    else {
        <div/>
    }

    let projectForm = addingProject ? <AddProject toggleAddingProject={toggleAddingProject} currentHobbieID={currentHobbieID} allHobbies={allHobbies} setHobbies={setHobbies} /> : <div />
    let expenseList = showExpenses ? <ExpenseList currentHobbieID={currentHobbieID} currentProjectID={currentProjectID} setShowExpenses={setShowExpenses} /> : <div />
    return (
        <div className="flex w-full bg-violet-950 md:m-2 md:rounded bg-opacity-50 border border-violet-950">
            <div className="w-full m-2 relative ">
                <div className="flex justify-center ">
                    <div className="text-2xl p-3"> Projects </div>
                </div>
                <div>
                    <div className=" absolute top-2 left-1 mx-2 p-2 inline-block rounded-lg hover:bg-metal hover:cursor-pointer"
                    onClick={toggleAddingProject}>
                    New Project +
                    </div>
                </div>
                
                <div id="projectList">
                    <div className="p-2 grid grid-cols-4 border-b">
                        <div className="">Name</div>
                        <div className="text-right">Rate</div>
                        <div className="text-right">Time</div>
                        <div className="text-right">Bank</div>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden">
                        {projectForm}
                        {projectList}
                    </div>
                    
                </div>
            </div>
            <div id="expenses"></div>
            {expenseList}
        </div>
        
    )
}

function AddProject({ toggleAddingProject, currentHobbieID, allHobbies, setHobbies }) {

    function calcTime(s, m, h, d) {
        let totalTime = 0;
        if (s) { totalTime += s }
        if (m) { totalTime += m * 60 }
        if (h) { totalTime += h * 3600 }
        if (d) { totalTime += d * 86400 }
        return totalTime;
    }

    function submitNewProject(formData: object) {
        let newProject = {
            title: formData.get("title"),
            price: parseFloat(formData.get("rate")),
            id: Math.floor(Math.random()*1000),
            parentID: currentHobbieID.id,
            time: calcTime(parseInt(formData.get("seconds")), parseInt(formData.get("minutes")), parseInt(formData.get("hours")), parseInt(formData.get("days"))),
            expenses: []
        }
        currentHobbieID.projects.push(newProject)
        setHobbies(allHobbies)
        toggleAddingProject()
    }
    return (
        <div className="bg-emerald-950 border border-emerald-800 rounded p-2">
            <form action={submitNewProject} autoComplete="off">
                <div className="grid grid-cols-4">
                    <input className="bg-teal-900 border border-teal-800" name="title" required></input>
                    <div className="flex justify-end">
                        $
                        <input className="bg-teal-900 border border-teal-800 text-right w-16" name="rate" required></input>
                    </div>
                    <div className="flex justify-end">
                        <input className="bg-teal-900 border border-teal-800 text-right w-8" name="days"></input>
                        :
                        <input className="bg-teal-900 border border-teal-800 text-right w-8" name="hours"></input>
                        :
                        <input className="bg-teal-900 border border-teal-800 text-right w-8" name="minutes"></input>
                        :
                        <input className="bg-teal-900 border border-teal-800 text-right w-8" name="seconds"></input>
                    </div>
                    <div></div>
                </div>
                <div className="flex justify-center">
                    <button className="m-3 p-2 rounded hover:bg-metal hover:cursor-pointer " type="button" onClick={toggleAddingProject}>
                        Cancel
                    </button>
                    <button className="m-3 p-2 rounded hover:bg-green-800 hover:cursor-pointer " type="submit">
                        Add
                    </button>
                    
                </div>
            </form>

        </div>
    )
}

function ExpenseForm({ addingExpense, setAddingExpense, project }) {
    function submitNewExpense(formData: object) {
        let newExpense = {
            title: formData.get("item"),
            cost: parseFloat(formData.get("cost")),
            id: Math.floor(Math.random() * 1000),
            parentID: project.id
        }
        if (project.expenses == null) {
            project.expenses = [newExpense]
        }
        else {
            project.expenses.unshift(newExpense)
        }
        setAddingExpense(false)
    }

    if (addingExpense) {
        return (
            <div className="bg-emerald-950 border border-emerald-800 rounded p-2 mb-2">
                <form action={submitNewExpense} autoComplete="off">
                    <div className="grid grid-cols-2">
                        <div>
                            <div>Item</div>
                            <input name="item" className="w-40 bg-teal-900 border border-teal-800" required></input>
                        </div>
                        <div className="text-right">
                            <div>Cost</div>
                            <input name="cost" className="w-16 bg-teal-900 border border-teal-800" required></input>
                        </div>
                        <button className="m-3 p-1 hover:bg-metal rounded" onClick={() => setAddingExpense(false)}>Cancel</button>
                        <button className="m-3 p-1 hover:bg-metal rounded" type="submit">Add</button>
                    </div>
                </form >
            </div>
            
        )
    }
    else {
        return (<div/>)
    }
    
}

function ExpenseList({ currentHobbieID, currentProjectID, setShowExpenses }) {
    const [addingExpense, setAddingExpense] = useState(false);
    const project = currentHobbieID.projects.find(project => project.id == currentProjectID)

    const closeExpensesRef = useClickAway(() => {
        if (window.innerWidth < 768) {
            setShowExpenses(false);
        }
    });

    function toggleAddingExpense() {
        setAddingExpense(!addingExpense);
    }

    if (project == null) {return(<div/>) }
    const expenses = project?.expenses;


    const expensesList = expenses?.map(expense =>
        <div className="flex justify-between odd:bg-violet-900 odd:bg-opacity-50 px-2" key={expense.key}>
            <div>
                {expense.title}
            </div>  
            <div>
                ${parseFloat(expense.cost).toFixed(2)}
            </div>
        </div>
    )

    return (
        <div className="absolute right-0 w-2/3 h-full md:h-auto md:relative md:w-1/3 p-2 md:m-2 flex flex-col bg-violet-950 rounded-l md:rounded border-l md:border border-violet-900 "
            ref={closeExpensesRef}>
            <div className="flex mb-2">
                <div className="p-2 px-4 inline-block rounded hover:bg-metal hover:cursor-pointer text-center"
                    onClick={() => setShowExpenses(false)} >
                    {"<"}
                </div>
                <div className="p-2 flex-grow rounded hover:bg-metal hover:cursor-pointer text-center"
                    onClick={toggleAddingExpense}>
                    Add an Expense
                </div>
            </div>
            <div className="border-b border-violet-800 mb-2"></div>
            <ExpenseForm addingExpense={addingExpense} setAddingExpense={setAddingExpense} project={project} />
            <div className="flex-grow mb-2 border-b border-violet-800">
                {expensesList}
            </div>
            <div>
                <div className="flex justify-between">
                    <div>Total Banked:</div>
                    <div>{"$" + (project.time / 3600 * project.price).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                    <div>Total Expenses:</div>
                    <div>{"$" + calculateTotalExpenses(project).toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                    <div>Remaining Banked:</div>
                    <div>{"$" + calculateBankAfterExpenses(project, project.time)}</div>
                </div>
            </div>
        </div>
    )
}






