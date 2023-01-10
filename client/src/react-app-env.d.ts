/// <reference types="react-scripts" />
declare module '*.svg' {
    const content: React.Compontent;
    export default content;
}

interface Array{
    equals:(array:Array)=>boolean
}

interface String {
    capitalFirst:()=>String
}

interface Date {
    toTime:()=>Date
    getWeekNumber:()=>number
}