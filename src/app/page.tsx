'use client'
import Image from 'next/image';
import { useState } from 'react';
import { useStopwatch } from 'react-timer-hook';

var hobbies = [
    {
        title: 'Woodworking', defaultPrice: 6.5, id: 1,
        projects: [
            { title: 'Jewely Box', price: 7, id: 12, parentID: 1, time: 650, timing: false },
            { title: 'Ruler Stand', price: 2, id: 14, parentID: 1, time: 300, timing: false },
            { title: 'Mask', price: 6.5, id: 15, parentID: 1, time: 8400, timing: false }
        ]
    },
    {
        title: 'Quilting', defaultPrice: 8.5, id: 2,
        projects: [
            {
                title: 'Void', price: 7, id: 16, parentID: 2, time: 650, timing: false

            },
            { title: 'Koozies', price: 2, id: 17, parentID: 2, time: 300, timing: false },
            { title: '3D Large', price: 6.5, id: 18, parentID: 2, time: 94300, timing: false }
        ]
    }
];

export default function Home() {
    
    const [currentHobbie, setCurrentHobbie] = useState(1);
    const [currentProject, setCurrentProject] = useState(12);

    function getCurrentHobbie() {
        return hobbies.find(hobbie => hobbie.id == currentHobbie)
    }

    function getCurrentProject() {
        var hobbie = getCurrentHobbie();
        return hobbie?.projects?.find(project => project.id == currentProject)
    }

    return (
        <main className="debug flex min-h-screen text-lg">
            <HobbieList currentHobbie={currentHobbie} setCurrentHobbie={setCurrentHobbie} get={getCurrentHobbie} />
            <ProjectList currentProject={currentProject} setCurrentProject={setCurrentProject} getHobbie={getCurrentHobbie}  />

        </main>
    )
}

function HobbieButton({ currentHobbie, setCurrentHobbie, hobbie }) {
    function clickHandle() {
        setCurrentHobbie(hobbie.id)
    }
    const totalTime = hobbie.projects.reduce((total, project) => total + project.time, 0)
    const isSelected = (currentHobbie == hobbie.id) ? "bg-blue-800" : ""
    return (
        <div className={"text-gray-400 rounded-lg border-gray-600 rounded hover:bg-blue-950 hover:cursor-pointer " + isSelected}
            onClick={clickHandle} >
            {hobbie.title}
            {totalTime}
        </div>
    )
}

function HobbieList({currentHobbie, setCurrentHobbie, get}) { 
    let hobbieList;
    if (get() != null) {
        hobbieList = hobbies.map(hobbie =>
            <div
                key={hobbie.id}>
                <HobbieButton currentHobbie={currentHobbie} setCurrentHobbie={setCurrentHobbie} hobbie={hobbie} />
            </div>)
    }
    else {
        <div/>
    }
    
    return (
        <div className="w-1/4 debug p-2 m-2 border border-gray-300">
            <div className="text-center">
                Add a Hobbie
            </div>
            <div className="flex flex-col">
                {hobbieList}
            </div>
        </div>
    )
}

function convertTime(days: number, hours: number, minutes: number, seconds:number) {
    return days + " days " + hours + " hrs " + minutes + " mins " + seconds
}

function ProjectDetails({ project, isRunning, startTiming, stopTiming }) {

    function toggleExpenses() {
        setExpenses(!showExpenses)
    }
    function toggleTimer() {
        isRunning ? stopTiming() : startTiming();
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

function ProjectItem({ setCurrentProject, project, currentProject }) {
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
    } = useStopwatch({ autoStart: false, stopwatchOffset: 36000 });
    const [openExpenses, setOpenExpenses] = useState(0);
    
    
    function setProject() {
        setCurrentProject(project.id)
    }
    const isCurrentProject = project.id == currentProject;
    let selectedClass;
    let lowerSection;
    let timingClass = "";
    if (isCurrentProject) {
        lowerSection = <ProjectDetails project={project} isRunning={isRunning} startTiming={start} stopTiming={pause}/>
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

function ProjectList({ currentProject, setCurrentProject, getHobbie }) {
    const currentHobbie = getHobbie();
    let projectList;
    if (currentHobbie != null) {
        projectList = currentHobbie.projects.map(project =>
            <div
                key={project.id}
                className=""
            >
                <ProjectItem setCurrentProject={setCurrentProject} project={project} currentProject={currentProject} />
            </div>)
    }
    else {
        <div className="debug" />
    }
    
    return (
        <div className="debug relative w-full m-2">
            <div className="flex justify-center">
                <div className="text-2xl p-3"> Projects </div>
                <div className="absolute m-2 p-2 left-0 rounded-lg hover:bg-metal hover:cursor-pointer"> New Project +</div>
            </div>
            
            <div>
                <div className="p-2 grid grid-cols-4">
                    <div className="">Name</div>
                    <div className="text-right">Rate</div>
                    <div className="text-right">Time</div>
                    <div className="text-right">Total Earned</div>
                </div>
                {projectList}
            </div>
        </div>
    )
}


function Expense() {

}

function ExpenseList() {

}





