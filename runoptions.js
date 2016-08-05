	var pcval = 0, acval = 0, mqval = 0, opval = "none", logval = "none", r_or_l = "left", end = false;
		var IASmem = [], allRun;
		
		var loadMem = function(){
			for(var i = 0; i<13; i++){
				var addr = "m" + i;
				IASmem[i] = document.getElementById(addr).value;
			}
			console.log(String(IASmem));
		}
		
		var runStep = function() {
			$("input").prop("disabled", true);
			var next = step();
			
			console.log("PC " + pcval);
			console.log("MQ " + mqval);
			console.log("AC " + acval);
			
			$("#stepbut").prop("disabled", end);
			$("#resetbut").prop("disabled", false);
			updateAll();
			
			if(end){ clearInterval(allRun); }
		}
		
		var runAll = function(){
			allRun = window.setInterval(runStep, 1000);
		}
		
		var resetAll = function(){
			pcval = 0;
			acval = 0;
			mqval = 0;
			opval = "none";
			logval = "none";
			r_or_l = "left";
			end = false;
			$("input").prop("disabled", false);
			$("#pcOutput").prop("disabled", true);
			$("#acOutput").prop("disabled", true);
			$("#mqOutput").prop("disabled", true);
			$("#opOutput").prop("disabled", true);
			$("#logOutput").prop("disabled", true);
			updateAll();
		}