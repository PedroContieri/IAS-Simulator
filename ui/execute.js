var end = false, allRun, ftc = true, execop = "", execspeed = 1000;

//Run next cicle
var runNext = function(){
	$("button").prop("disabled", true);
	var nxt = next();
	$("#nextbut").prop("disabled", end);
	$("#resetbut").prop("disabled", false);
	updateAll();
	if(end){ window.clearInterval(allRun); }
};

//Run next step
var runStep= function(){
	runNext();
	runNext();
	$("#stepbut").prop("disabled", end);
	if(end){ window.clearInterval(allRun); }
};

//Run all code
var runAll = function(){
	allRun = window.setInterval(runStep, execspeed);
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

		end = true;
		alert("PROGRAM ABORTED" + "\n" +
			  "exception name: " + exception.name + "\n" +
			  "exception message: " + exception.message
			 );
		//alert("PROGRAM ABORTED\n" + exception);
		window.clearInterval(allRun);
		return;
	}
};

//Reset IAS machine
var resetAll = function(){
	$("button").prop("disabled", false);
	updateAll();
	updateImage("reset");
	IAS.reset();
	end = false;
};

//Set run all speed
var setSpeed = function(){
	var spdd = document.getElementById("speedset").value;
	if(Number(spdd) <= 0)
		execspeed = 1000;
	else
		execspeed = Number(spdd);
};

//Allow only numbers events
var validateNumber = function (event) {
    var key = window.event ? event.keyCode : event.which;

    if (event.keyCode === 8 || event.keyCode === 46
     || event.keyCode === 37 || event.keyCode === 39) {
        return true;
    }
    else if ( key < 48 || key > 57 ) {
        return false;
    }
    else return true;
};
