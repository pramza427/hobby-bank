'use client'
import { useState, useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { Tooltip } from 'react-tooltip';
import { useClickAway } from '@uidotdev/usehooks';
import { Convert, Hobbie, Project, Expense } from "./types";

// ------------------------------------------
// -----------  Helper Functions  -----------
// ------------------------------------------

const SMALL_SCREEN = 768

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

function calculateTotalExpenses(project: Project) {
    var expensesCost = project?.expenses?.reduce((total: number, expense: Expense) => total + expense.cost, 0);
    return expensesCost = expensesCost ?? 0;
}

function calculateBankAfterExpenses(project: Project, totalSeconds: number) {
    var rateTime = totalSeconds / 3600 * project.rate
    var expensesCost = calculateTotalExpenses(project);

    return (rateTime - expensesCost).toFixed(2)
}

function calcBankAfterExpenses(hobbie: Hobbie) {
    var totalBank = 0.0
    hobbie.projects.forEach((project: Project) => {
        var rateTime = project.time / 3600 * project.rate
        var expensesCost = calculateTotalExpenses(project);
        totalBank += rateTime - expensesCost
    })
    return totalBank.toFixed(2)
}
// ------- Dark Mode -----------



// ------- Local Storage -------

function saveLocal(hobbies: Array<Hobbie>) {
    window.localStorage.setItem("hobbies", Convert.hobbieToJson(hobbies))
    console.log("Saved to local")
}

function loadLocal(setHobbies: Function, setCurrentHobbieID: Function) {
    const json = window.localStorage.getItem("hobbies")
    const hobbies = json ? Convert.toHobbie(json) : []
    setHobbies(hobbies);
    if (hobbies) {
        setCurrentHobbieID(hobbies[0].id);
    }
}

// ------- File Storage -------

const saveFile = async (blob: any) => {
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
    input.onchange = (e: Event) => {
        var file = null;
        if (!input.files) {
            alert("Please select a file before clicking 'Load'");
        }
        else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);
        }
        function receivedText(e: any) {
            let json = e.target.result;
            const hobbies = Convert.toHobbie(json);
            setHobbies(hobbies);
        }
    }
    input.click();
}

// ----------------------------------------
// -----------  Main Rendering  -----------
// ----------------------------------------

export default function Home() {

    const [currentHobbieID, setCurrentHobbieID] = useState(0);
    const [currentProjectID, setCurrentProjectID] = useState(0);
    const [hobbies, setHobbies] = useState(Array<Hobbie>);
    const [showExpenses, setShowExpenses] = useState(false);

    useEffect(() => {
        loadLocal(setHobbies, setCurrentHobbieID);
        return
    }, [setHobbies, setCurrentHobbieID])

    function getCurrentHobbie() {
        return hobbies.find((hobbie: any) => hobbie.id == currentHobbieID)
    }

    return (
        <main className="flex min-h-screen text-xs md:text-lg overflow-hidden">
            <HobbieList allHobbies={hobbies} setHobbies={setHobbies} currentHobbieID={currentHobbieID} setCurrentHobbieID={setCurrentHobbieID} />
            <ProjectList allHobbies={hobbies} setHobbies={setHobbies} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} getCurrentHobbie={getCurrentHobbie} showExpenses={showExpenses} setShowExpenses={setShowExpenses} />
            <ExpenseList allHobbies={hobbies} setHobbies={setHobbies} getCurrentHobbie={getCurrentHobbie} currentProjectID={currentProjectID} showExpenses={showExpenses} setShowExpenses={setShowExpenses} />
        </main>
    )
}

// ----------------------------------------
// -----------  Hobbie Sidebar  -----------
// ----------------------------------------

function HobbieButton({ currentHobbieID, setCurrentHobbieID, hobbie, allHobbies, setHobbies }:
    {
        currentHobbieID: number,
        setCurrentHobbieID: Function,
        hobbie: any,
        allHobbies: any,
        setHobbies: Function
    }) {
    function clickHandle() {
        setCurrentHobbieID(hobbie.id)
    }
    function deleteHobbie(event: any) {
        event.stopPropagation()
        if (window.confirm("Delete " + hobbie.title + "?")) {
            let filteredHobbies = allHobbies.filter((h: Hobbie) => h.id != hobbie.id);
            setHobbies(filteredHobbies);
            saveLocal(filteredHobbies);
        }
    }
    let totalTime = hobbie.projects.reduce((total: number, project: Project) => total + project.time, 0)
    const isSelected = (currentHobbieID == hobbie.id) ? " bg-indigo-900 bg-opacity-100 " : " hover:bg-metal "
    return (
        <div className={"group p-1 rounded hover:cursor-pointer " + isSelected}
            onClick={clickHandle} >
            <div className="flex justify-between w-full">
                <div>{hobbie.title}</div>
                <div>{"$" + calcBankAfterExpenses(hobbie)}</div>
            </div>

            <div className="flex justify-between w-full">
                <div className="hidden group-hover:block hover:bg-red-900 rounded px-2" onClick={deleteHobbie}>
                    <i className="fa-solid fa-trash"></i>
                </div>
                <div className="text-right flex-grow">{convertTotalTime(totalTime)}</div>
            </div>

        </div>
    )
}

function HobbieList({ allHobbies, setHobbies, currentHobbieID, setCurrentHobbieID }:
    {
        allHobbies: Array<Hobbie>,
        setHobbies: Function,
        currentHobbieID: number,
        setCurrentHobbieID: Function
    }
) {
    const [addingHobbie, setAddingHobbie] = useState(false);
    const [showHobbies, setShowHobbies] = useState(true);

    const closeHobbiesRef: any = useClickAway(() => {
        if (window.innerWidth < SMALL_SCREEN) {
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

    useEffect(() => {
        console.log("Update Hobbies")
    })

    let hobbieList;
    if (allHobbies.length != 0) {
        hobbieList = allHobbies.map((hobbie: Hobbie) =>
            <div className="border-b border-indigo-900"
                key={hobbie.id}>
                <HobbieButton currentHobbieID={currentHobbieID} setCurrentHobbieID={setCurrentHobbieID} hobbie={hobbie} allHobbies={allHobbies} setHobbies={setHobbies} />
            </div>)
    }
    else {
        <div />
    }

    let hobbieForm = addingHobbie ? <AddHobbie toggleAddingHobbie={toggleAddingHobbie} currentHobbieID={currentHobbieID} allHobbies={allHobbies} setHobbies={setHobbies} /> : <div />

    if (showHobbies) {
        return (
            <div className="absolute h-full w-1/2 z-10 p-2 rounded-r md:relative md:h-auto md:w-1/3 border-r border-indigo-900 bg-indigo-950 flex flex-col"
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
                <div className="border-b border-indigo-900 mt-2 mb-2"></div>
                {hobbieForm}
                <div className="flex flex-col">
                    {hobbieList}
                </div>
                <div className="flex-grow border-b border-indigo-900 mb-2"></div>
                <div className="mx-1 p-1 hover:cursor-pointer hover:bg-metal rounded flex justify-between "
                    onClick={() => loadLocal(setHobbies, setCurrentHobbieID)}>
                    Load from Local
                    <div className=" px-4" id="local-warning">
                        i
                    </div>
                    <Tooltip anchorSelect="#local-warning" >
                        <div className="z-50">
                            Changes will be automatically saved locally, but data can be lost if cache is cleared.
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
            <div className="w-10 border-r border-indigo-900 bg-indigo-950 cursor-pointer"
                onClick={() => setShowHobbies(true)}>
                <div className="[writing-mode:vertical-lr] py-5 px-2">Hobbies</div>
            </div>
        )
    }

}

function AddHobbie({ toggleAddingHobbie, currentHobbieID, allHobbies, setHobbies }:
    { toggleAddingHobbie: Function, currentHobbieID: any, allHobbies: any, setHobbies: Function }
) {
    function submitNewHobbie(formData: any) {
        let newHobbie = {
            title: formData.get("name"),
            id: Math.floor(Math.random() * 1000),
            projects: []
        }
        allHobbies.unshift(newHobbie)
        setHobbies(allHobbies)
        saveLocal(allHobbies)
        toggleAddingHobbie()
    }

    return (
        <div className="bg-violet-950 border border-violet-800 rounded mb-2"
            onClick={() => toggleAddingHobbie()}
        >
            <div onClick={event => event.stopPropagation()}
                className="p-2 inline-block ">
                <form action={submitNewHobbie} autoComplete="off">
                    <div>
                        <div>
                            Name of Hobbie
                        </div>
                        <input className="bg-indigo-900 border border-indigo-800 bg-opacity-50" name="name" required></input>
                    </div>

                    <button type="button" className="m-3 p-1 rounded hover:bg-metal" onClick={() => toggleAddingHobbie()} >Cancel</button>
                    <button type="submit" className="m-3 p-1 rounded hover:bg-metal">Confirm</button>
                </form>
            </div>

        </div>
    )
}

// ---------------------------------------------
// -----------  Project Main Screen  -----------
// ---------------------------------------------

function ProjectDetails({ allHobbies, setHobbies, project, isRunning, startTiming, stopTiming, totalSeconds, setEditing, showExpenses, setShowExpenses }:
    {
        allHobbies: Array<Hobbie>,
        setHobbies: Function,
        project: Project,
        isRunning: boolean,
        startTiming: Function,
        stopTiming: Function,
        totalSeconds: number,
        setEditing: Function,
        showExpenses: boolean,
        setShowExpenses: Function
    }
) {

    function toggleExpenses() {
        setShowExpenses(!showExpenses)
    }
    function toggleTimer() {
        if (isRunning) {
            stopTiming();
            project.time = totalSeconds;
            setHobbies([...allHobbies])
            saveLocal(allHobbies)
        }
        else {
            startTiming();
        }
    }
    var timerText = isRunning ? "Stop Timer" : "Start Timer"
    if (isRunning) {
        return (
            <div className="flex">
                <div className="mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={toggleTimer}>
                    {timerText}
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="flex justify-between">
                <div className="mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={toggleTimer}>
                    {timerText}
                </div>
                <div className="mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal"
                    onClick={() => setEditing(true)}>
                    <div className="flex items-center">
                        <i className="fa-solid fa-pen-to-square mr-2"></i>
                        Edit
                    </div>
                </div>
            </div>
        )
    }

}

function ProjectItem({ allHobbies, setHobbies, setCurrentProjectID, project, currentProjectID, deleteProject, showExpenses, setShowExpenses }:
    {
        allHobbies: Array<Hobbie>,
        setHobbies: Function,
        setCurrentProjectID: Function,
        project: Project,
        currentProjectID: number,
        deleteProject: Function,
        showExpenses: boolean,
        setShowExpenses: Function
    }
) {
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
        setCurrentProjectID(project.id);
    }
    function editProject(formData: any) {
        console.log(allHobbies)
        setEditing(false);
        project.title = formData.get("title") ?? project.title;
        project.rate = parseFloat(formData.get("rate")) ?? project.rate;
        var newTime = parseInt(formData.get("days")) * 86400 + parseInt(formData.get("hours")) * 3600 + parseInt(formData.get("minutes")) * 60 + parseInt(formData.get("seconds"))
        const stopwatchOffset = new Date();
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + newTime ?? 0)
        reset(stopwatchOffset, false);
        project.time = newTime;
        setHobbies([...allHobbies])
        saveLocal(allHobbies)
    }

    function deleteProjectView() {
        deleteProject(project.id);
        var elem = document.getElementById(project.id.toString());
        var listElem = document.getElementById("projectList")
        console.log(elem);
        setEditing(false);
        setCurrentProjectID(null);
        saveLocal(allHobbies);

    }
    const handleFocus = (event: any) => event.target.select();
    const editingRef: any = useClickAway(() => {
        setEditing(false);
    });

    const iscurrentProjectID = project.id == currentProjectID;
    let selectedClass;
    let lowerSection;
    let timingClass = "";
    if (iscurrentProjectID) {
        lowerSection = <ProjectDetails allHobbies={allHobbies} setHobbies={setHobbies} project={project} isRunning={isRunning} startTiming={start} stopTiming={pause} totalSeconds={totalSeconds} setEditing={setEditing} showExpenses={showExpenses} setShowExpenses={setShowExpenses} />
        selectedClass = "bg-indigo-950 "
    }
    else {
        lowerSection = <div></div>
        selectedClass = "hover:bg-metal "
    }
    { isRunning ? timingClass = " timing " : "" }

    if (editing) {
        return (
            <div className="p-2 bg-indigo-950" ref={editingRef}>
                <form action={editProject}>
                    <div className="grid grid-cols-4">
                        <input className="bg-slate-800 border border-gray-700" name="title" defaultValue={project.title} onClick={handleFocus}></input>
                        <div className="flex justify-end">
                            $
                            <input className="bg-slate-800 border border-gray-700 text-right w-16" name="rate" defaultValue={project.rate.toFixed(2)} onClick={handleFocus}></input>
                        </div>
                        <div className="flex justify-end">
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="days" defaultValue={days} onClick={handleFocus}></input>
                            :
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="hours" defaultValue={hours} onClick={handleFocus}></input>
                            :
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="minutes" defaultValue={minutes} onClick={handleFocus}></input>
                            :
                            <input className="bg-slate-800 border border-gray-700 text-right w-8" name="seconds" defaultValue={seconds} onClick={handleFocus}></input>
                        </div>
                        <div className="text-right">{"$" + calculateBankAfterExpenses(project, totalSeconds)}</div>
                    </div>
                    <div className="flex justify-center">
                        <button className="m-3 p-2 rounded hover:bg-metal hover:cursor-pointer " type="button" onClick={() => setEditing(false)}>
                            Cancel
                        </button>
                        <button className="m-3 p-2 rounded hover:bg-green-800 hover:cursor-pointer " type="submit">
                            Done
                        </button>
                        <button className="m-3 ml-5 p-2 rounded hover:bg-red-800 hover:cursor-pointer" type="button" onClick={deleteProjectView}>
                            <i className="fa-solid fa-trash"></i>
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
                    <div className="text-right">${project.rate.toFixed(2)}</div>
                    <div className="text-right">{convertTime(days, hours, minutes, seconds)}</div>
                    <div className="text-right">{"$" + calculateBankAfterExpenses(project, totalSeconds)}</div>
                </div>
                {lowerSection}
            </div>

        )
    }
}

function ProjectList({ allHobbies, setHobbies, currentProjectID, setCurrentProjectID, getCurrentHobbie, showExpenses, setShowExpenses }:
    {
        allHobbies: Array<Hobbie>,
        setHobbies: Function,
        currentProjectID: number,
        setCurrentProjectID: Function,
        getCurrentHobbie: Function,
        showExpenses: boolean,
        setShowExpenses: Function
    }) {
    const [addingProject, setAddingProject] = useState(false);

    function toggleAddingProject() {
        setAddingProject(!addingProject);
        setCurrentProjectID(null);
    }

    const currentHobbie = getCurrentHobbie();
    function deleteProject(id: number) {
        currentHobbie.projects = currentHobbie.projects.filter((project: Project) => project.id != id)
    }
    let projectList;
    if (currentHobbie != null) {
        projectList = currentHobbie.projects.map((project: Project) =>
            <div
                key={project.id}
                id={project.id.toString()}
                className="even:bg-indigo-950 even:bg-opacity-30"
            >
                <ProjectItem allHobbies={allHobbies} setHobbies={setHobbies} setCurrentProjectID={setCurrentProjectID} project={project} currentProjectID={currentProjectID} deleteProject={deleteProject} showExpenses={showExpenses} setShowExpenses={setShowExpenses} />
            </div>)
    }
    else {
        <div />
    }

    let projectForm = addingProject ? <AddProject toggleAddingProject={toggleAddingProject} currentHobbie={currentHobbie} allHobbies={allHobbies} setHobbies={setHobbies} /> : <div />
    return (
        <div className="flex w-full bg-indigo-950 bg-opacity-50 border-indigo-900">
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
        </div>
    )
}

function AddProject({ toggleAddingProject, currentHobbie, allHobbies, setHobbies }:
    {
        toggleAddingProject: Function,
        currentHobbie: Hobbie,
        allHobbies: Array<Hobbie>,
        setHobbies: Function
    }) {

    function calcTime(s: number, m: number, h: number, d: number) {
        let totalTime = 0;
        if (s) { totalTime += s }
        if (m) { totalTime += m * 60 }
        if (h) { totalTime += h * 3600 }
        if (d) { totalTime += d * 86400 }
        return totalTime;
    }

    function submitNewProject(formData: any) {
        console.log(formData)
        const newProject: Project = {
            title: formData.get("title"),
            rate: parseFloat(formData.get("rate")),
            id: Math.floor(Math.random() * 1000),
            parentID: currentHobbie.id,
            time: calcTime(parseInt(formData.get("seconds")), parseInt(formData.get("minutes")), parseInt(formData.get("hours")), parseInt(formData.get("days"))),
            expenses: []
        }
        currentHobbie.projects.push(newProject)
        console.log(newProject)
        setHobbies([...allHobbies])
        toggleAddingProject()
    }
    return (
        <div className="bg-violet-950 border border-violet-800 rounded p-2">
            <form action={submitNewProject} autoComplete="off">
                <div className="grid grid-cols-4">
                    <input className="bg-indigo-900 border border-indigo-800 bg-opacity-50" name="title" required></input>
                    <div className="flex justify-end">
                        $
                        <input className="bg-indigo-900 border border-indigo-800 bg-opacity-50 text-right w-16" name="rate" placeholder="0.00" required></input>
                    </div>
                    <div className="flex justify-end">
                        <input className="bg-indigo-900 border border-indigo-800 bg-opacity-50 text-right w-8" name="days" placeholder="d"></input>
                        :
                        <input className="bg-indigo-900 border border-indigo-800 bg-opacity-50 text-right w-8" name="hours" placeholder="h"></input>
                        :
                        <input className="bg-indigo-900 border border-indigo-800 bg-opacity-50 text-right w-8" name="minutes" placeholder="m"></input>
                        :
                        <input className="bg-indigo-900 border border-indigo-800 bg-opacity-50 text-right w-8" name="seconds" placeholder="s"></input>
                    </div>
                    <div></div>
                </div>
                <div className="flex justify-center">
                    <button className="m-3 p-2 rounded hover:bg-metal hover:cursor-pointer " type="button" onClick={() => toggleAddingProject()}>
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

// ------------------------------------------
// -----------  Expenses Sidebar  -----------
// ------------------------------------------

function ExpenseForm({ allHobbies, setHobbies, addingExpense, setAddingExpense, project }:
    {
        allHobbies: Array<Hobbie>,
        setHobbies: Function,
        addingExpense: boolean,
        setAddingExpense: Function,
        project: Project
    }
) {
    function submitNewExpense(formData: any) {
        let newExpense: Expense = {
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
            project.expenses = project.expenses.sort((a, b) => a.title > b.title ? 1 : -1)
        }
        setAddingExpense(false)
        setHobbies([...allHobbies])
        saveLocal(allHobbies)
    }

    if (addingExpense) {
        return (
            <div className="bg-violet-950 border border-violet-800 rounded p-2 mb-2">
                <form action={submitNewExpense} autoComplete="off">
                    <div className="grid grid-cols-2">
                        <div>
                            <div>Item</div>
                            <input name="item" className="w-40 bg-indigo-900 border border-indigo-800 bg-opacity-50" required></input>
                        </div>
                        <div className="text-right">
                            <div>Cost</div>
                            <input name="cost" className="w-16 bg-indigo-900 border border-indigo-800 bg-opacity-50" required></input>
                        </div>
                        <button className="m-3 p-1 hover:bg-metal rounded" type="button" onClick={() => setAddingExpense(false)}>Cancel</button>
                        <button className="m-3 p-1 hover:bg-metal rounded" type="submit">Add</button>
                    </div>
                </form >
            </div>
        )
    }
    else {
        return (<div />)
    }
}

function ExpenseList({ allHobbies, setHobbies, getCurrentHobbie, currentProjectID, showExpenses, setShowExpenses }:
    {
        allHobbies: Array<Hobbie>,
        setHobbies: Function,
        getCurrentHobbie: Function,
        currentProjectID: number,
        showExpenses: boolean,
        setShowExpenses: Function
    }
) {
    const [addingExpense, setAddingExpense] = useState(false);
    const currentHobbie = getCurrentHobbie()
    const project = currentHobbie?.projects.find((project: Project) => project.id == currentProjectID)

    const closeExpensesRef: any = useClickAway(() => {
        if (window.innerWidth < SMALL_SCREEN) {
            setShowExpenses(false);
        }
    });

    function deleteExpense(expenseID: number) {
        project.expenses = project.expenses.filter((e: Expense) => e.id != expenseID);
        setHobbies([...allHobbies])
        saveLocal(allHobbies);
    }

    function toggleAddingExpense() {
        setAddingExpense(!addingExpense);
    }

    const expenses = project?.expenses ?? [];


    const expensesList = expenses?.map((expense: any) =>
        <div className="group flex justify-between odd:bg-indigo-900 odd:bg-opacity-50 px-2" key={expense.id}>
            <div>
                {expense.title}
            </div>
            <div className="flex">
                ${parseFloat(expense.cost).toFixed(2)}
                <div className="hidden group-hover:block hover:bg-red-900 rounded px-2 ml-2 cursor-pointer" onClick={() => deleteExpense(expense.id)}>
                    <i className="fa-solid fa-trash"></i>
                </div>
            </div>

        </div>
    )

    const expenseHiddenBlock =
        <div className="w-10 border-l border-indigo-900 bg-indigo-950 cursor-pointer"
            onClick={() => setShowExpenses(true)}>
            <div className="[writing-mode:vertical-lr] py-5 px-2">Expenses</div>
        </div>

    var expenseShowBlock = project == null
        ? <div className="absolute right-0 w-1/2 h-full md:h-auto md:relative md:w-1/3 p-2 flex flex-col bg-indigo-950 border-l border-indigo-900 "
            ref={closeExpensesRef}>
            <div className="flex mb-2">
                <div className="disabled p-2 flex-grow rounded hover:bg-metal hover:cursor-not-allowed opacity-50 text-center">
                    Add an Expense
                </div>
                <div className="p-2 px-4 inline-block rounded hover:bg-metal hover:cursor-pointer text-center"
                    onClick={() => setShowExpenses(false)} >
                    {">"}
                </div>

            </div>
            <div className="border-b border-indigo-900 mb-2"></div>
            <div className="flex-grow mb-2 border-b border-indigo-900">
            </div>
        </div>

        : <div className="absolute right-0 w-1/2 h-full md:h-auto md:relative md:w-1/3 p-2 flex flex-col bg-indigo-950 border-l border-indigo-900 "
            ref={closeExpensesRef}>
            <div className="flex mb-2">
                <div className="p-2 flex-grow rounded hover:bg-metal hover:cursor-pointer text-center"
                    onClick={toggleAddingExpense}>
                    Add an Expense
                </div>
                <div className="p-2 px-4 inline-block rounded hover:bg-metal hover:cursor-pointer text-center"
                    onClick={() => setShowExpenses(false)} >
                    {">"}
                </div>

            </div>
            <div className="border-b border-indigo-900 mb-2"></div>
            <ExpenseForm allHobbies={allHobbies} setHobbies={setHobbies} addingExpense={addingExpense} setAddingExpense={setAddingExpense} project={project} />
            <div className="flex-grow mb-2 border-b border-indigo-900">
                {expensesList}
            </div>
            <div>
                <div className="flex justify-between">
                    <div>Total Banked:</div>
                    <div>{"$" + (project.time / 3600 * project.rate).toFixed(2)}</div>
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

    if (showExpenses) {
        return (expenseShowBlock)
    }
    else {
        return (expenseHiddenBlock)
    }
}






