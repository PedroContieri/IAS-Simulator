var end = false, allRun, ftc = true, execop = "";

//Run next cicle
var runNext = function(){
	$("button").prop("disabled", true);
	var nxt = next();
	$("#nextbut").prop("disabled", end);
	$("#resetbut").prop("disabled", false);
	updateAll();
};

//Run next step
var runStep= function(){
	runNext();
	runNext();
	$("#stepbut").prop("disabled", end);
	if(end){ clearInterval(allRun); }
};

//Run all code
var runAll = function(){
	allRun = window.setInterval(runStep, 1000);
};

//Call cpu methods
var next = function(){
	try{
		if (ftc){
			ftc = false;
			IAS.fetch();
		} else{
			ftc = true;
			IAS.execute();
		}
		
	} catch(exception){
		alert("PROGRAM ABORTED" + "\n" +
			  "exception name: " + exception.name + "\n" +
			  "exception message: " + exception.message
			 );
		end = true;
	}
};

//Reset IAS machine
var resetAll = function(){
	$("button").prop("disabled", false);
	updateAll();
	updateImage("reset");
	IAS.reset();
};
