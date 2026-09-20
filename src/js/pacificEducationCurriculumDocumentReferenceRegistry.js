/*
 * Pacific Education — Curriculum Document Reference Registry
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * References authoritative curriculum documents without embedding or
 * certifying their contents. Document IDs/URLs are references only.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var KEY="pacificEducationCurriculumDocumentReferences";
    var MAX=1000;

    function copy(v){return JSON.parse(JSON.stringify(v));}
    function read(){
        try{
            var raw=window.localStorage.getItem(KEY);
            var value=raw?JSON.parse(raw):[];
            return Array.isArray(value)?value:[];
        }catch(e){return [];}
    }
    function write(items){
        try{window.localStorage.setItem(KEY,JSON.stringify(items.slice(-MAX)));}catch(e){}
    }

    function register(input){
        input=input||{};
        if(!input.documentId) throw new Error("documentId required");
        if(!input.title) throw new Error("title required");
        if(!input.reference) throw new Error("reference required");

        var item={
            documentId:String(input.documentId),
            title:String(input.title),
            reference:String(input.reference),
            documentType:input.documentType||"curriculum-document",
            issuingAuthority:input.issuingAuthority||"",
            version:input.version||"",
            publicationDate:input.publicationDate||"",
            accessedDate:input.accessedDate||new Date().toISOString(),
            notes:input.notes||"",
            sourceStatus:input.sourceStatus||"unverified",
            prototype:true,
            productionEligible:false
        };

        var items=read();
        var i=items.findIndex(function(x){return x.documentId===item.documentId;});
        if(i>=0) items[i]=item; else items.push(item);
        write(items);
        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumDocumentReferenceChanged",{detail:copy(item)}));
        return copy(item);
    }

    function get(documentId){
        var item=read().find(function(x){return x.documentId===String(documentId);});
        return item?copy(item):null;
    }

    function list(filters){
        filters=filters||{};
        return read().filter(function(x){
            return (!filters.sourceStatus||x.sourceStatus===filters.sourceStatus) &&
                   (!filters.documentType||x.documentType===filters.documentType);
        }).map(copy);
    }

    function validate(){
        var errors=[];
        read().forEach(function(x){
            if(!x.documentId) errors.push("Document reference missing documentId");
            if(!x.title) errors.push((x.documentId||"record")+": missing title");
            if(!x.reference) errors.push((x.documentId||"record")+": missing reference");
        });
        return {valid:errors.length===0,errors:errors,count:read().length,prototype:true,productionEligible:false};
    }

    function exportReferences(){return copy(read());}
    function reset(){try{window.localStorage.removeItem(KEY);}catch(e){}}

    window.PacificEducationCurriculumDocumentReferenceRegistry=Object.freeze({
        name:"PacificEducationCurriculumDocumentReferenceRegistry",
        version:VERSION,
        register:register,
        get:get,
        list:list,
        validate:validate,
        exportReferences:exportReferences,
        reset:reset
    });
})(window);
