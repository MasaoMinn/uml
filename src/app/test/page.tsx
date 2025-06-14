"use client";

import { useEffect, useState } from "react";

const App=()=> {
    const [status, setStatus] = useState<boolean>(false);
    const A =()=>{
        return (
            <>
            {status?<div>A is running</div>:<div>A is not running</div>}
            
            </>
        )
    }
    const B = ()=>{
        return (
            !status?<div>B is running</div>:<div>B is not running</div>
        )
    }
    return (
        <div>
            <h1>App</h1>
            <button onClick={()=>setStatus(!status)}>Toggle</button>
            <A />
            <B />
        </div>
    )
}
const Test = () =>{
    let status:boolean=false;
    const A =()=>{
        return (
            <>
            {status?<div>A is running</div>:<div>A is not running</div>}
            </>
        )
    }
    const B = ()=>{
        return (
            !status?<div>B is running</div>:<div>B is not running</div>
        )
    }
    return (
        <div>
            <h1>Test</h1>
            <button onClick={()=>{status=!status}}>Toggle</button>
            <A />
            <B />
        </div>
    )
}
const Test2 = () =>{
    let status:boolean=false;
    const A =()=>{
        return (
            <>
            {status?<div>A is running</div>:<div>A is not running</div>}
            </>
        )
    }
    const B = ()=>{
        return (
            !status?<div>B is running</div>:<div>B is not running</div>
        )
    }
    useEffect(()=>{A},[status]);
    useEffect(()=>{B},[status]);
    return (
        <div>
            <h1>Test2</h1>
            <button onClick={()=>{status=!status}}>Toggle</button>
            <A />
            <B />
        </div>
    )
}

function Home() {
    return (
        <div>
            <App />
            <Test />
            <Test2 />
        </div>
    )
};
export default Home;