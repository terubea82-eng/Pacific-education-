/* Pacific Education — Teacher Class Roster Context */
(function(window, document) {
    "use strict";
    var VERSION = "1.2.0";
    var CLASS_KEY = "pacificEducationSelectedClassId";
    var ROSTER_KEY = "pacificEducationPrototypeClassRosters";
    function load() { try { var raw=window.localStorage.getItem(ROSTER_KEY); var data=raw?JSON.parse(raw):{}; return data&&typeof data==="object"?data:{}; } catch(e){ return {}; } }
    function save(data) { try { window.localStorage.setItem(ROSTER_KEY,JSON.stringify(data)); } catch(e){} }
    function getClassId() { try { return window.localStorage.getItem(CLASS_KEY)||""; } catch(e){ return ""; } }
    function getClass(classId) { var data=load(); var item=data[String(classId||getClassId()).trim()]; return item?JSON.parse(JSON.stringify(item)):null; }
    function setClassId(classId) {
        var id=String(classId||"").trim();
        try { if(id) window.localStorage.setItem(CLASS_KEY,id); else window.localStorage.removeItem(CLASS_KEY); } catch(e){}
        var selectedClass=id?getClass(id):null;
        if(selectedClass&&selectedClass.level){ try { window.localStorage.setItem("pacificEducationLevel",String(selectedClass.level)); } catch(e){} }
        window.dispatchEvent(new CustomEvent("pacificEducationClassChanged",{detail:{classId:id,level:selectedClass?selectedClass.level||null:null,prototype:true}}));
        return id;
    }
    function createClass(classId,level,teacherRef,section) {
        var id=String(classId||"").trim(); if(!id) return {success:false,error:"Class reference required"};
        var data=load();
        if(!data[id]) data[id]={classId:id,level:level||"",section:section||"",teacherRef:teacherRef||"",studentRefs:[],prototype:true,productionEligible:false};
        else { if(level) data[id].level=level; if(section!==undefined) data[id].section=String(section||"").trim(); if(teacherRef!==undefined) data[id].teacherRef=String(teacherRef||"").trim(); }
        save(data); return {success:true,class:data[id],prototype:true};
    }
    function addStudent(classId,studentRef) {
        var id=String(classId||getClassId()).trim(), student=String(studentRef||"").trim();
        if(!id) return {success:false,error:"Class reference required"};
        if(!student) return {success:false,error:"Student reference required"};
        var data=load();
        if(!data[id]) return {success:false,error:"Class not found. Select an existing Class Reference before adding a student."};
        if(data[id].studentRefs.indexOf(student)<0) data[id].studentRefs.push(student);
        save(data); return {success:true,class:data[id],prototype:true};
    }
    function removeStudent(classId,studentRef){var id=String(classId||getClassId()).trim(),data=load();if(!data[id])return{success:false,error:"Class not found"};data[id].studentRefs=data[id].studentRefs.filter(function(ref){return ref!==String(studentRef||"").trim();});save(data);return{success:true,class:data[id],prototype:true};}
    function getStudents(classId){var item=getClass(classId);return item?item.studentRefs.slice():[];}
    function selectStudent(studentRef){var context=window.PacificEducationStudentCoverageContext;if(!context||typeof context.setStudentId!=="function")return{success:false,error:"Student Coverage Context unavailable"};var id=String(studentRef||"").trim(),classId=getClassId(),students=getStudents(classId);if(!id||students.indexOf(id)<0)return{success:false,error:"Student reference is not in the selected class roster"};context.setStudentId(id);return{success:true,classId:classId,studentId:id,prototype:true};}
    function getContext(){var current=getClass();return{classId:getClassId()||null,level:current?(current.level||null):null,section:current?(current.section||null):null,teacherRef:current?(current.teacherRef||null):null,studentRefs:getStudents(),prototype:true,productionEligible:false};}
    window.PacificEducationTeacherClassRosterContext=Object.freeze({name:"PacificEducationTeacherClassRosterContext",version:VERSION,getClasses:function(){return load();},getClassId:getClassId,setClassId:setClassId,createClass:createClass,addStudent:addStudent,removeStudent:removeStudent,getClass:getClass,getStudents:getStudents,selectStudent:selectStudent,getContext:getContext});
})(window,document);