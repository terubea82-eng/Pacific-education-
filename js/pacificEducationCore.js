/* PACIFIC EDUCATION - CENTRAL EDUCATION CORE - Version 1.2.1 */
(function(window){
  "use strict";

  const VERSION="1.2.1";
  const STORAGE_KEY="pacificEducationCoreState";
  const PASS_MARK=80;

  const ROLES=Object.freeze([
    "student","teacher","parent","ministry",
    "head_of_school","examiner","owner","admin"
  ]);

  const DEFAULT_STATE={
    version:VERSION,
    identity:{
      userId:null,name:"",role:null,country:"",
      jurisdiction:"",schoolId:null,classId:null,
      authorized:false
    },
    workspace:{
      workspaceId:null,type:"personal",status:"active"
    },
    student:{
      studentId:null,name:"",yearForm:"",
      className:"",subjects:[]
    },
    curriculum:{
      country:"",jurisdiction:"",version:"",
      yearForm:"",subject:"",currentConcept:"",
      verified:false
    },
    lesson:{
      lessonId:null,day:null,subject:"",
      title:"",concept:"",status:"not_started"
    },
    dailyLearningCheck:{
      checkId:null,concept:"",questions:[],
      attempted:false,score:null,
      understandingPercent:null,status:"not_started"
    },
    activities:[],
    learningHistory:[],
    assessments:[],
    marks:[],
    interventions:[],
    audit:[],
    events:[]
  };

  const clone=v=>{
    try{return JSON.parse(JSON.stringify(v));}
    catch(e){return null;}
  };

  const obj=v=>!!(
    v &&
    typeof v==="object" &&
    !Array.isArray(v)
  );

  function merge(a,b){
    if(!obj(b)) return a;
    Object.keys(b).forEach(k=>{
      a[k]=obj(b[k])&&obj(a[k])
        ? merge(a[k],b[k])
        : b[k];
    });
    return a;
  }

  const now=()=>new Date().toISOString();

  const id=p=>
    p+"-"+Date.now().toString(36)+"-"+
    Math.random().toString(36).slice(2,9);

  function load(){
    try{
      const raw=
        window.localStorage &&
        window.localStorage.getItem(STORAGE_KEY);

      return raw
        ? merge(clone(DEFAULT_STATE),JSON.parse(raw))
        : clone(DEFAULT_STATE);
    }catch(e){
      return clone(DEFAULT_STATE);
    }
  }

  let state=load();

  function save(){
    state.version=VERSION;
    try{
      if(window.localStorage){
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(state)
        );
      }
    }catch(e){
      console.error(
        "Pacific Education Core save failed",
        e
      );
    }
  }

  function audit(action,details){
    state.audit.push({
      auditId:id("AUDIT"),
      action:action,
      details:obj(details)?clone(details):{},
      timestamp:now()
    });
    save();
  }

  function emit(name,payload){
    const event={
      eventId:id("EVENT"),
      name:name,
      payload:clone(payload)||{},
      timestamp:now()
    };

    state.events.push(event);

    if(
      typeof window.dispatchEvent==="function" &&
      typeof window.CustomEvent==="function"
    ){
      window.dispatchEvent(
        new CustomEvent(
          "pacificEducation:"+name,
          {detail:event.payload}
        )
      );
    }

    save();
    return clone(event);
  }

  function authorized(){
    return !!(
      state.identity &&
      state.identity.authorized===true
    );
  }

  function requireAuth(action){
    if(authorized()) return true;

    audit(
      String(action||"ACTION")+"_BLOCKED",
      {reason:"User is not authorized."}
    );

    return false;
  }

  function authorize(ctx){
    if(!obj(ctx)||ctx.authorized!==true){
      state.identity.authorized=false;
      audit("AUTHORIZATION_DENIED",{});
      return false;
    }

    state.identity.authorized=true;

    audit(
      "AUTHORIZATION_GRANTED",
      {
        userId:state.identity.userId,
        role:state.identity.role
      }
    );

    emit(
      "authorizationGranted",
      state.identity
    );

    return true;
  }

  function setIdentity(v){
    if(!obj(v)) return false;

    state.identity=merge(
      state.identity,
      v
    );

    if(v.authorized!==true){
      state.identity.authorized=false;
    }

    audit(
      "IDENTITY_UPDATED",
      {
        userId:state.identity.userId,
        role:state.identity.role,
        authorized:state.identity.authorized
      }
    );

    emit(
      "identityUpdated",
      state.identity
    );

    return clone(state.identity);
  }

  const identity={
    set:setIdentity,
    get:()=>clone(state.identity),
    isAuthorized:authorized,
    authorize:authorize
  };

  function protectedSet(
    key,
    v,
    action,
    event
  ){
    if(!requireAuth(action)||!obj(v)){
      return false;
    }

    state[key]=merge(
      state[key],
      v
    );

    audit(
      action+"_UPDATED",
      v
    );

    emit(
      event,
      state[key]
    );

    return clone(state[key]);
  }

  function setLesson(v){
    return protectedSet(
      "lesson",
      v,
      "LESSON",
      "lessonUpdated"
    );
  }

  function createDailyLearningCheck(v){
    if(
      !requireAuth(
        "DAILY_LEARNING_CHECK_CREATE"
      )
    ){
      return false;
    }

    v=obj(v)?v:{};

    state.dailyLearningCheck={
      checkId:
        v.checkId||id("CHECK"),

      concept:
        typeof v.concept==="string"
          ?v.concept
          :"",

      questions:
        Array.isArray(v.questions)
          ?clone(v.questions)
          :[],

      attempted:false,
      score:null,
      understandingPercent:null,
      status:"not_started"
    };

    audit(
      "DAILY_LEARNING_CHECK_CREATED",
      {
        checkId:
          state.dailyLearningCheck.checkId
      }
    );

    emit(
      "dailyLearningCheckCreated",
      state.dailyLearningCheck
    );

    return clone(
      state.dailyLearningCheck
    );
  }

  function startDailyLearning(o){
    if(
      !requireAuth(
        "DAILY_LEARNING_START"
      )
    ){
      return false;
    }

    if(obj(o)&&obj(o.lesson)){
      setLesson(o.lesson);
    }

    return createDailyLearningCheck(
      obj(o)&&obj(o.check)
        ?o.check
        :{
          concept:
            obj(o)&&o.concept
              ?o.concept
              :state.lesson.concept,

          questions:
            obj(o)&&o.questions
              ?o.questions
              :[]
        }
    );
  }

  function recordDailyLearningCheck(v){
    if(
      !requireAuth(
        "DAILY_LEARNING_CHECK_RECORD"
      )
    ){
      return false;
    }

    v=obj(v)?v:{};

    const total=Number(v.total);
    const correct=Number(v.correct);

    let pct=null;

    if(
      Number.isFinite(total)&&
      total>0&&
      Number.isFinite(correct)
    ){
      pct=Math.round(
        Math.max(
          0,
          Math.min(correct,total)
        )/total*100
      );
    }

    state.dailyLearningCheck.attempted=true;

    state.dailyLearningCheck.score={
      correct:
        Number.isFinite(correct)
          ?correct
          :0,

      total:
        Number.isFinite(total)
          ?total
          :0
    };

    state.dailyLearningCheck
      .understandingPercent=pct;

    state.dailyLearningCheck.status=
      pct===null
        ?"teacher_review_required"
        :pct<PASS_MARK
          ?"intervention_required"
          :"continue";

    audit(
      "DAILY_LEARNING_CHECK_RECORDED",
      {
        checkId:
          state.dailyLearningCheck.checkId,

        understandingPercent:pct,

        status:
          state.dailyLearningCheck.status
      }
    );

    emit(
      "dailyLearningCheckRecorded",
      state.dailyLearningCheck
    );

    return clone(
      state.dailyLearningCheck
    );
  }

  const dailyLearningCheck={
    start:startDailyLearning,
    create:createDailyLearningCheck,
    record:recordDailyLearningCheck,
    get:()=>clone(
      state.dailyLearningCheck
    )
  };

  function addActivity(v){
    if(!requireAuth("ACTIVITY_ADD")){
      return false;
    }

    v=obj(v)?v:{};

    const r={
      activityId:
        v.activityId||id("ACT"),

      date:
        v.date||now(),

      subject:
        v.subject||"",

      title:
        v.title||"",

      concept:
        v.concept||"",

      status:
        v.status||"assigned",

      evidence:
        v.evidence||null,

      attempts:[]
    };

    state.activities.push(r);

    audit(
      "ACTIVITY_ADDED",
      {activityId:r.activityId}
    );

    emit(
      "activityAdded",
      r
    );

    return clone(r);
  }

  function recordActivityAttempt(
    activityId,
    result
  ){
    if(
      !requireAuth(
        "ACTIVITY_ATTEMPT"
      )
    ){
      return false;
    }

    const a=
      state.activities.find(
        x=>x.activityId===activityId
      );

    if(!a) return false;

    a.attempts=
      Array.isArray(a.attempts)
        ?a.attempts
        :[];

    a.attempts.push({
      attemptId:id("ATTEMPT"),
      result:clone(result),
      timestamp:now()
    });

    audit(
      "ACTIVITY_ATTEMPT_RECORDED",
      {activityId:activityId}
    );

    emit(
      "activityAttemptRecorded",
      {
        activityId:activityId,
        result:clone(result)
      }
    );

    return clone(a);
  }

  function addAssessment(v){
    if(
      !requireAuth("ASSESSMENT_ADD")||
      !obj(v)
    ){
      return false;
    }

    const r=clone(v);

    r.assessmentId=
      r.assessmentId||
      id("ASSESSMENT");

    r.createdAt=
      r.createdAt||
      now();

    if(
      typeof r.score==="number" &&
      typeof r.pass!=="boolean"
    ){
      r.pass=
        r.score>=PASS_MARK;
    }

    state.assessments.push(r);

    audit(
      "ASSESSMENT_ADDED",
      {
        assessmentId:r.assessmentId,
        type:
          r.type||
          r.assessmentType||
          "",
        score:r.score,
        pass:r.pass
      }
    );

    emit(
      "assessmentAdded",
      r
    );

    return clone(r);
  }

  const assessments={
    add:addAssessment,
    record:addAssessment,

    getAll:()=>
      clone(state.assessments),

    getById:idv=>
      clone(
        state.assessments.find(
          x=>x.assessmentId===idv
        )||null
      ),

    latest:()=>
      clone(
        state.assessments[
          state.assessments.length-1
        ]||null
      )
  };

  function transferMark(
    assessmentId,
    v
  ){
    if(
      !requireAuth("MARK_TRANSFER")||
      typeof assessmentId!=="string"||
      !assessmentId.trim()
    ){
      return false;
    }

    v=obj(v)?clone(v):{};

    const r={
      markId:id("MARK"),
      assessmentId:assessmentId,

      studentId:
        v.studentId||
        state.student.studentId||
        null,

      score:
        v.score!==undefined
          ?v.score
          :null,

      percentage:
        v.percentage!==undefined
          ?v.percentage
          :v.score!==undefined
            ?v.score
            :null,

      grade:
        v.grade||"",

      subject:
        v.subject||
        state.lesson.subject||
        "",

      status:
        v.status||"verified",

      source:
        v.source||"assessment",

      createdAt:now(),
      updatedAt:now()
    };

    state.marks.push(r);

    audit(
      "MARK_TRANSFERRED",
      {
        markId:r.markId,
        assessmentId:assessmentId
      }
    );

    emit(
      "markTransferred",
      r
    );

    return clone(r);
  }

  function editMark(
    markId,
    changes,
    reason
  ){
    if(!requireAuth("MARK_EDIT")){
      return false;
    }

    const r=
      state.marks.find(
        x=>x.markId===markId
      );

    if(!r) return false;

    changes=
      obj(changes)
        ?changes
        :{};

    Object.keys(changes)
      .forEach(k=>{
        if(k!=="markId"){
          r[k]=clone(
            changes[k]
          );
        }
      });

    r.updatedAt=now();

    r.editReason=
      typeof reason==="string"
        ?reason
        :"Authorized mark correction";

    audit(
      "MARK_EDITED",
      {
        markId:markId,
        reason:r.editReason
      }
    );

    emit(
      "markEdited",
      r
    );

    return clone(r);
  }

  const marks={
    transfer:transferMark,
    edit:editMark,

    getAll:()=>
      clone(state.marks),

    getById:idv=>
      clone(
        state.marks.find(
          x=>x.markId===idv
        )||null
      )
  };

  function createIntervention(v){
    if(
      !requireAuth(
        "INTERVENTION_CREATE"
      )
    ){
      return false;
    }

    v=obj(v)?v:{};

    const r={
      interventionId:
        id("INTERVENTION"),

      studentId:
        v.studentId||
        state.student.studentId||
        null,

      reason:
        v.reason||"",

      target:
        v.target||"",

      action:
        v.action||"",

      status:
        "proposed",

      createdAt:
        now()
    };

    state.interventions.push(r);

    audit(
      "INTERVENTION_CREATED",
      {
        interventionId:
          r.interventionId
      }
    );

    emit(
      "interventionCreated",
      r
    );

    return clone(r);
  }

  function approveIntervention(
    interventionId,
    approval
  ){
    if(
      !requireAuth(
        "INTERVENTION_APPROVE"
      )
    ){
      return false;
    }

    const r=
      state.interventions.find(
        x=>
          x.interventionId===
          interventionId
      );

    if(!r) return false;

    r.status=
      approval===false
        ?"rejected"
        :"approved";

    r.approvedAt=now();

    audit(
      "INTERVENTION_STATUS_CHANGED",
      {
        interventionId:
          interventionId,
        status:r.status
      }
    );

    emit(
      "interventionStatusChanged",
      r
    );

    return clone(r);
  }

  const api={
    version:VERSION,
    passMark:PASS_MARK,
    roles:ROLES.slice(),

    getState:()=>clone(state),
    saveState:save,

    isAuthorized:authorized,
    authorizeUser:authorize,
    requireAuthorization:requireAuth,

    identity:identity,

    setIdentity:setIdentity,
    getIdentity:()=>clone(state.identity),

    setWorkspace:v=>
      protectedSet(
        "workspace",
        v,
        "WORKSPACE",
        "workspaceUpdated"
      ),

    getWorkspace:()=>
      clone(state.workspace),

    setStudent:v=>
      protectedSet(
        "student",
        v,
        "STUDENT",
        "studentUpdated"
      ),

    getStudent:()=>
      clone(state.student),

    setCurriculum:v=>
      protectedSet(
        "curriculum",
        v,
        "CURRICULUM",
        "curriculumUpdated"
      ),

    getCurriculum:()=>
      clone(state.curriculum),

    setLesson:setLesson,

    getLesson:()=>
      clone(state.lesson),

    startDailyLearning:
      startDailyLearning,

    dailyLearningCheck:
      dailyLearningCheck,

    createDailyLearningCheck:
      createDailyLearningCheck,

    recordDailyLearningCheck:
      recordDailyLearningCheck,

    getDailyLearningCheck:()=>
      clone(
        state.dailyLearningCheck
      ),

    addActivity:addActivity,

    recordActivityAttempt:
      recordActivityAttempt,

    getActivities:()=>
      clone(state.activities),

    recordLearningHistory:v=>{
      if(
        !requireAuth(
          "LEARNING_HISTORY"
        )
      ){
        return false;
      }

      const r={
        historyId:id("HISTORY"),
        timestamp:now(),
        data:clone(v)
      };

      state.learningHistory.push(r);

      audit(
        "LEARNING_HISTORY_RECORDED",
        {
          historyId:r.historyId
        }
      );

      emit(
        "learningHistoryRecorded",
        r
      );

      return clone(r);
    },

    getLearningHistory:()=>
      clone(state.learningHistory),

    assessments:assessments,
    addAssessment:addAssessment,

    getAssessments:()=>
      clone(state.assessments),

    getAssessmentById:idv=>
      clone(
        state.assessments.find(
          x=>x.assessmentId===idv
        )||null
      ),

    getLatestAssessment:()=>
      clone(
        state.assessments[
          state.assessments.length-1
        ]||null
      ),

    marks:marks,
    transferMark:transferMark,
    editMark:editMark,

    getMarks:()=>
      clone(state.marks),

    getMarkById:idv=>
      clone(
        state.marks.find(
          x=>x.markId===idv
        )||null
      ),

    createIntervention:
      createIntervention,

    approveIntervention:
      approveIntervention,

    getInterventions:()=>
      clone(state.interventions),

    getUnderstandingStatus:()=>
      ({
        dailyLearningCheck:
          clone(
            state.dailyLearningCheck
          ),

        latestAssessment:
          clone(
            state.assessments[
              state.assessments.length-1
            ]||null
          ),

        understandingPercent:
          state
            .dailyLearningCheck
            .understandingPercent,

        status:
          state
            .dailyLearningCheck
            .status,

        interventionRequired:
          state
            .dailyLearningCheck
            .status===
          "intervention_required"
      }),

    getStatus:()=>
      ({
        version:VERSION,
        authorized:authorized(),

        identity:
          clone(state.identity),

        student:
          clone(state.student),

        lesson:
          clone(state.lesson),

        dailyLearningCheck:
          clone(
            state.dailyLearningCheck
          ),

        assessments:
          state.assessments.length,

        marks:
          state.marks.length,

        interventions:
          state.interventions.length
      }),

    connectModules:modules=>{
      modules=
        obj(modules)
          ?modules
          :{};

      audit(
        "MODULES_CONNECTED",
        {
          modules:
            Object.keys(modules)
        }
      );

      emit(
        "modulesConnected",
        {
          modules:
            Object.keys(modules)
        }
      );

      return{
        connected:true,
        modules:
          Object.keys(modules),
        version:VERSION
      };
    },

    resetPrototypeState:()=>{
      state=clone(DEFAULT_STATE);
      save();

      audit(
        "PROTOTYPE_STATE_RESET",
        {}
      );

      emit(
        "prototypeStateReset"
      );

      return true;
    }
  };

  window.PacificEducationCore=
    Object.freeze(api);

  emit(
    "coreReady",
    {version:VERSION}
  );

})(window);
