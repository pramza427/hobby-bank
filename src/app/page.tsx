'use client'
import { randomInt } from 'crypto';
import Image from 'next/image';
import { useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { Tooltip } from 'react-tooltip';

function convertTime(days: number, hours: number, minutes: number, seconds: number) {
    var d = days < 10 ? "0" + days : days;
    var h = hours < 10 ? "0" + hours : hours;
    var m = minutes < 10 ? "0" + minutes : minutes;
    var s = seconds < 10 ? "0" + seconds : seconds
    return d + ":" + h + ":" + m + ":" + s
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

function calculateBankAfterExpenses(project: object) {
    var rateTime = project.time / 3600 * project.price
    var expensesCost = calculateTotalExpenses(project);

    return (rateTime - expensesCost).toFixed(2)
}

export default function Home() {
    
    const [currentHobbie, setCurrentHobbie] = useState(1);
    const [currentProject, setCurrentProject] = useState(12);
    const [hobbies, setHobbies] = useState([]);

    function getCurrentHobbie() {
        return hobbies.find(hobbie => hobbie.id == currentHobbie)
    }

    return (
        <main className="debug flex min-h-screen text-lg">
            <HobbieList allHobbies={hobbies} setHobbies={setHobbies} currentHobbie={currentHobbie} setCurrentHobbie={setCurrentHobbie} get={getCurrentHobbie} />
            <ProjectList allHobbies={hobbies} setHobbies={setHobbies} currentProject={currentProject} setCurrentProject={setCurrentProject} getHobbie={getCurrentHobbie}  />

        </main>
    )
}

function HobbieButton({ currentHobbie, setCurrentHobbie, hobbie }) {
    function clickHandle() {
        setCurrentHobbie(hobbie.id)
    }
    const totalTime = hobbie.projects.reduce((total, project) => total + project.time, 0)
    const isSelected = (currentHobbie == hobbie.id) ? " bg-midnight " : " hover:bg-metal "
    return (
        <div className={"p-1 rounded hover:cursor-pointer " + isSelected}
            onClick={clickHandle} >
            <div>{hobbie.title}</div> 
            <div className="text-right">{convertTotalTime(totalTime)}</div>
        </div>
    )
}

function HobbieList({ allHobbies, setHobbies, currentHobbie, setCurrentHobbie, get }) { 
    const [addingHobbie, setAddingHobbie] = useState(false);
    function toggleAddingHobbie() {
        setAddingHobbie(!addingHobbie);
    }
    let hobbieList;
    if (allHobbies.length != 0) {
        hobbieList = allHobbies.map(hobbie =>
            <div
                key={hobbie.id}>
                <HobbieButton currentHobbie={currentHobbie} setCurrentHobbie={setCurrentHobbie} hobbie={hobbie} />
            </div>)
    }
    else {
        <div/>
    }
    function getHobbiesFromLocal() {
        setHobbies(JSON.parse(window.localStorage.getItem("hobbies")) ?? [])
    }

    let hobbieForm = addingHobbie ? <AddHobbie toggleAddingHobbie={toggleAddingHobbie} currentHobbie={currentHobbie} allHobbies={allHobbies} setHobbies={setHobbies} /> : <div />

    return (
        <div className="w-1/4 debug p-2 m-2 border border-gray-300 flex flex-col">
            <div className="text-center hover:bg-metal hover:cursor-pointer"
                onClick={toggleAddingHobbie}>
                Add a Hobbie
            </div>
            {hobbieForm}
            <div className="flex flex-col">
                {hobbieList}
            </div>
            <div className="flex-grow"></div>
            <div className="hover:cursor-pointer hover:bg-midnight flex justify-between z-1"
                onClick={getHobbiesFromLocal}>
                Load from Local
                <div className="z-100 px-4" id="local-warning">             
                    i
                </div>
                <Tooltip anchorSelect="#local-warning">
                    <div className="z-50">
                        Saving to local can lead to lost data when clearing chache
                    </div> 
                </Tooltip>
            </div>
        </div>
    )
}

function AddHobbie({ toggleAddingHobbie, currentHobbie, allHobbies, setHobbies }) {
    function submitNewHobbie(formData: object) {
        let newHobbie = {
            title: formData.get("name"),
            id: Math.floor(Math.random() * 1000),
            projects: []
        }
        allHobbies.push(newHobbie)
        setHobbies(allHobbies)
        toggleAddingHobbie()
    }

    return (
        <div className="absolute z-50 top-0 left-0 w-full h-full bg-opacity-90 bg-slate-950 "
        onClick={toggleAddingHobbie }
        >
            <div onClick={event => event.stopPropagation()}
                className="p-2 m-3 inline-block bg-metal border border-gray-800 rounded">
                <form action={submitNewHobbie}>
                    <div>
                        <div>
                            Name of Hobbie
                        </div>
                        <input className="bg-slate-800 border border-gray-700 active:border-blue-900" name="name"></input>
                    </div>

                    <button type="button" className="m-3 p-1 hover:bg-metal" onClick={toggleAddingHobbie} >Cancel</button>
                    <button type="submit" className="m-3 p-1 hover:bg-metal">Confirm</button>
                </form>
            </div>
            
        </div>
    )
}

function ProjectDetails({ allHobbies, project, isRunning, startTiming, stopTiming, totalSeconds, setEditing, setShowExpenses }) {

    function toggleExpenses() {
        setShowExpenses(true)
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
    return (
        <div className="relative flex justify-center">
            <div className="absolute left-0 mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                onClick={() => setEditing(true) }>
                Edit
            </div>
            <div className="mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                onClick={toggleTimer}>
                {timerText}
            </div>
            <div className="mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal">Add Time</div>
            <div className="absolute right-0 mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                onClick={toggleExpenses}>
                {"Expenses ->"}</div>
        </div>
    )
}

function ProjectItem({ allHobbies, setCurrentProject, project, currentProject, deleteProject, setShowExpenses }) {
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
        setCurrentProject(project.id);
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
        //listElem?.removeChild(elem);
    }
    const handleFocus = (event:any) => event.target.select();

    const isCurrentProject = project.id == currentProject;
    let selectedClass;
    let lowerSection;
    let timingClass = "";
    if (isCurrentProject) {
        lowerSection = <ProjectDetails allHobbies={allHobbies} project={project} isRunning={isRunning} startTiming={start} stopTiming={pause} totalSeconds={totalSeconds} setEditing={setEditing} setShowExpenses={setShowExpenses} />
        selectedClass = "bg-midnight "
    }
    else {
        lowerSection = <div></div>
        selectedClass = "hover:bg-metal "
    }
    { isRunning ? timingClass = " timing " : "" }

    if (editing) {
        return (
            <div className="p-2 bg-midnight">
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
                        <div className="text-right">{"$" + calculateBankAfterExpenses(project)}</div>
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
            <div className={"p-2 hover:cursor-pointer " + selectedClass + timingClass}
                onClick={setProject}>
                <div className="grid grid-cols-4">
                    <div className="">{project.title}</div>
                    <div className="text-right">${parseFloat(project.price).toFixed(2)}</div>
                    <div className="text-right">{convertTime(days, hours, minutes, seconds)}</div>
                    <div className="text-right">{"$" + calculateBankAfterExpenses(project)}</div>
                </div>
                {lowerSection}
            </div>

        )
    }
}

function ProjectList({ allHobbies, setHobbies, currentProject, setCurrentProject, getHobbie }) {
    const [addingProject, setAddingProject] = useState(false);
    const [showExpenses, setShowExpenses] = useState(false);

    function toggleAddingProject() {
        setAddingProject(!addingProject);
    }
    
    const currentHobbie = getHobbie();
    function deleteProject(id) {
        currentHobbie.projects = currentHobbie.projects.filter(project => project.id != id)
    }
    let projectList;
    if (currentHobbie != null) {
        projectList = currentHobbie.projects.map(project =>
            <div
                key={project.id}
                id={project.id}
                className=""
            >
                <ProjectItem allHobbies={allHobbies} setCurrentProject={setCurrentProject} project={project} currentProject={currentProject} deleteProject={deleteProject} setShowExpenses={setShowExpenses} />
            </div>)
    }
    else {
        <div className="debug" />
    }

    let projectForm = addingProject ? <AddProject toggleAddingProject={toggleAddingProject} currentHobbie={currentHobbie} allHobbies={allHobbies} setHobbies={setHobbies} /> : <div />
    let expenseList = showExpenses ? <ExpenseList currentHobbie={currentHobbie} currentProject={currentProject}/> : <div />
    return (
        <div className="flex w-full">
            <div className="debug relative w-full m-2">
                <div className="flex justify-center">
                    <div className="text-2xl p-3"> Projects </div>
                    <div className="absolute m-2 p-2 left-0 rounded-lg hover:bg-metal hover:cursor-pointer"
                        onClick={toggleAddingProject}>
                        New Project +
                    </div>
                </div>
                {projectForm}
                <div id="projectList">
                    <div className="p-2 grid grid-cols-4 border-b">
                        <div className="">Name</div>
                        <div className="text-right">Rate</div>
                        <div className="text-right">Time</div>
                        <div className="text-right">Bank</div>
                    </div>
                    {projectList}
                </div>
            </div>
            {expenseList}
        </div>
        
    )
}

function AddProject({ toggleAddingProject, currentHobbie, allHobbies, setHobbies}) {
    function submitNewProject(formData: object) {
        let newProject = {
            title: formData.get("name"),
            price: parseFloat(formData.get("rate")),
            id: Math.floor(Math.random()*1000),
            parentID: currentHobbie.id,
            time: parseInt(formData.get("seconds")),
            expenses: []
        }
        currentHobbie.projects.push(newProject)
        setHobbies(allHobbies)
        toggleAddingProject()
    }
    return (
        <div className="absolute z-50 top-0 w-full h-full bg-opacity-90 bg-slate-950 "
        //onClick={toggleAddingProject }
        >
            <form action={submitNewProject}>
                <div>
                    <div>
                        Name of Project
                    </div>
                    <input className="bg-slate-800 border border-gray-700 active:border-blue-900" name="name"></input>
                </div>
                <div>
                    <div>
                        $/hr
                    </div>
                    <input className="bg-slate-800 border border-gray-700" type="number" step="0.01"  name="rate"></input>
                </div>
                <div>
                    <div>
                    Total time
                    </div>
                    <input className="bg-slate-800 border border-gray-700" type="number" name="seconds"></input>
                </div>
                
                <button type="button" className="m-3 p-1 hover:bg-metal" onClick={toggleAddingProject} >Cancel</button>
                <button type="submit" className="m-3 p-1 hover:bg-metal">Confirm</button>
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
            <form action={submitNewExpense}>
                <div className="grid grid-cols-2">
                    <div>
                        <div>Item</div>
                        <input name="item" className="w-40 bg-slate-800 border border-gray-700"></input>
                    </div>
                    <div className="text-right">
                        <div>Cost</div>
                        <input name="cost" className="w-16 bg-slate-800 border border-gray-700"></input>
                    </div>
                    <button className="m-3 p-1 hover:bg-metal" onClick={() => setAddingExpense(false)}>Cancel</button>
                    <button className="m-3 p-1 hover:bg-metal" type="submit">Add</button>
                </div>
            </form >
        )
    }
    else {
        return (<div className="debug" />)
    }
    
}

function ExpenseList({ currentHobbie, currentProject }) {
    const [addingExpense, setAddingExpense] = useState(false);
    const project = currentHobbie.projects.find(project => project.id == currentProject)

    if (project == null) {return(<div/>) }
    const expenses = project?.expenses;


    const expensesList = expenses?.map(expense =>
        <div className="flex justify-between" key={expense.key}>
            <div>
                {expense.title}
            </div>  
            <div>
                ${parseFloat(expense.cost).toFixed(2)}
            </div>
        </div>
    )

    return (
        <div className="w-1/3 p-2 m-2 debug flex flex-col">
            <div className="p-2 hover:bg-metal hover:cursor-pointer text-center"
                onClick={() => setAddingExpense(true)}>
                Add an Expense
            </div>
            <ExpenseForm addingExpense={addingExpense} setAddingExpense={setAddingExpense} project={project} />
            <div className="flex-grow">
                {expensesList}
            </div>
            <div className="pt-2 border-t border-gray-800">
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
                    <div>{"$" + calculateBankAfterExpenses(project)}</div>
                </div>
            </div>
        </div>
    )
}






