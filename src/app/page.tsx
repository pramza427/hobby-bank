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

function HobbieList({allHobbies, setHobbies, currentHobbie, setCurrentHobbie, get}) { 
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

    return (
        <div className="w-1/4 debug p-2 m-2 border border-gray-300 flex flex-col">
            <div className="text-center hover:bg-metal hover:cursor-pointer"
                onClick={() => console.log("add Hobbie") }>
                Add a Hobbie
            </div>
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

function ProjectDetails({ allHobbies, project, isRunning, startTiming, stopTiming, totalSeconds }) {

    function toggleExpenses() {
        setExpenses(!showExpenses)
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
            <div className="absolute left-0 mx-3 my-2 p-2 rounded-lg text-center hover:cursor-pointer hover:bg-metal">Edit</div>
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

function ProjectItem({ allHobbies, setCurrentProject, project, currentProject }) {
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

    const [openExpenses, setOpenExpenses] = useState(0);
    
    
    function setProject() {
        setCurrentProject(project.id)
    }
    const isCurrentProject = project.id == currentProject;
    let selectedClass;
    let lowerSection;
    let timingClass = "";
    if (isCurrentProject) {
        lowerSection = <ProjectDetails allHobbies={allHobbies} project={project} isRunning={isRunning} startTiming={start} stopTiming={pause} totalSeconds={totalSeconds} />
        selectedClass = "bg-midnight "
    }
    else {
        lowerSection = <div></div>
        selectedClass = "hover:bg-metal "
    }
    { isRunning ? timingClass = " timing " : ""}

    return (
        <div className={"p-2 hover:cursor-pointer " + selectedClass + timingClass}
            onClick={setProject}>
            <div className="grid grid-cols-4">
                <div className="">{project.title}</div>
                <div className="text-right">{parseFloat(project.price).toFixed(2)}</div>
                <div className="text-right">{convertTime(days, hours, minutes, seconds)}</div>
                <div className="text-right">{"$" + (totalSeconds / 3600 * project.price).toFixed(2)}</div>
            </div>
            {lowerSection}
        </div>
        
    )
}

function ProjectList({ allHobbies, setHobbies, currentProject, setCurrentProject, getHobbie }) {
    const [addingProject, setAddingProject] = useState(false);
    function toggleAddingProject() {
        setAddingProject(!addingProject);
    }

    const currentHobbie = getHobbie();
    let projectList;
    if (currentHobbie != null) {
        projectList = currentHobbie.projects.map(project =>
            <div
                key={project.id}
                className=""
            >
                <ProjectItem allHobbies={allHobbies} setCurrentProject={setCurrentProject} project={project} currentProject={currentProject} />
            </div>)
    }
    else {
        <div className="debug" />
    }

    let projectForm = addingProject ? <AddProject toggleAddingProject={toggleAddingProject} currentHobbie={currentHobbie} allHobbies={allHobbies}  setHobbies={setHobbies} /> : <div/>
    
    return (
        <div className="debug relative w-full m-2">
            <div className="flex justify-center">
                <div className="text-2xl p-3"> Projects </div>
                <div className="absolute m-2 p-2 left-0 rounded-lg hover:bg-metal hover:cursor-pointer"
                    onClick={toggleAddingProject}>
                    New Project +
                </div>
            </div>
            {projectForm}
            <div>
                <div className="p-2 grid grid-cols-4 border-b">
                    <div className="">Name</div>
                    <div className="text-right">Rate</div>
                    <div className="text-right">Time</div>
                    <div className="text-right">Bank</div>
                </div>
                {projectList}
            </div>
        </div>
    )
}

function AddProject({ toggleAddingProject, currentHobbie, allHobbies, setHobbies}) {
    function submitNewProject(formData: object) {
        let newProject = {
            title: formData.get("name"),
            price: parseInt(formData.get("rate")),
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
                    <input className="bg-slate-800 border border-gray-700" type="number" name="rate"></input>
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

function Expense() {

}

function ExpenseList() {

}





