var step = function (){ 
	var word = IASmem[pcval]
	
	//Opcodes e imediatos
	var opLeft = word.slice(0,2);
	var immLeft = word.slice(2,5);
	
	var opRight = word.slice(5,7);
	var immRight = word.slice(7,10);
	
	var opcode, immediate;
	
	
	// Busca (fetch)
	if(r_or_l === "left"){
		
		opcode = opLeft.toUpperCase();
		immediate = immLeft.toUpperCase();
		
		r_or_l = "right";
		
	} else {
		
		opcode = opRight.toUpperCase();
		immediate = immRight.toUpperCase();
		
		r_or_l = "left";
		pcval++;
	}
	
	console.log("OPCODE " + opcode);
	console.log("IMMED " + immediate);
	
	
	switch(opcode){
		
		//LOADMQ
		case "0A":
			acval = mqval;
			opval = "LOAD MQ";
			break;
		
		//LOADMQM
		case "09":
			mqval = trueNumbDec(parseInt(IASmem[parseInt(immediate, 16)], 16));
			opval = "LOAD MQM";
			break;
			
		//STORM
		case "21":
			IASmem[parseInt(immediate, 16)] = acval.toString(16).toUpperCase;
			opval = "STORM";
			break;
			
		//LOADM
		case "01":
			acval = trueNumbDec(parseInt(IASmem[parseInt(immediate, 16)], 16));
			opval = "LOAD M";
			break;
		
		//LOAD-M
		case "02":
			acval = (- trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)])), 16));
			opval = "LOAD -M";
			break;
		
		//LOAD|M|
		case "03":
			acval = Math.abs(trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)])), 16));
			opval = "LOAD |M|";
			break;
			
		//JUMPLEFT
		case "0D":
			r_or_l = "left";
			pcval = trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)]), 16));
			opval = "JUMP LEFT";
			break;
			
		//JUMPRIGHT
		case "0E":
			r_or_l = "right";
			pcval = trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)]), 16));
			opval = "JUMP RIGHT";
			break;
		
		//JUMPLEFTCOND
		case "0F":
			if (acval < 0){
				r_or_l = "left";
				pcval = trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)]), 16));
			}
			opval = "JUMP COND";
			break;
			
		//JUMPRIGHTCOND
		case "10":
			if (acval < 0){
				r_or_l = "right";
				pcval = trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)]), 16));
			}
			opval = "JUMP RIGHT COND";
			break;
		
		//ADDM
		case "05":
			acval += trueNumbDec(parseInt(IASmem[parseInt(immediate, 16)], 16));
			opval = "ADD M";
			break;
			
		//ADD|M|
		case "07":
			acval += Math.abs(trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)])), 16));
			opval = "ADD |M|";
			break;
		
		//SUBM
		case "06":
			acval -= trueNumbDec(parseInt(IASmem[parseInt(immediate, 16)], 16));
			opval = "SUB M";
			break;
			
		//SUB|M|
		case "08":
			acval -= Math.abs(trueNumbDec(parseInt((IASmem[parseInt(immediate, 16)])), 16));
			opval = "SUB |M|";
			break;
		
		//MUL
		case "0B":
			acval = mqval * trueNumbDec(parseInt(IASmem[parseInt(immediate, 16)], 16));
			opval = "MUL";
			break;
		
		//DIV
		case "0C":
			mqval = acval / trueNumbDec(parseInt(IASmem[parseInt(immediate, 16)], 16));
			acval = acval % trueNumbDec(parseInt(IASmem[parseInt(immediate, 16)], 16));
			opval = "DIV";
			break;
			
		//LSH
		case "14":
			acval *= 2;
			opval = "LSH";
			break;
			
		//RSH
		case "15":
			acval /= 2;
			opval = "RSH";
			break;
			
		//STORMXLEFT
		case "12":
			var tmp = acval & 0x0000000111;
			
			var tmpstr = IASmem[parseInt(immediate, 16)];
			
			var start = tmpstr.slice(0,2);
			var fim = tmpstr.slice(5,10);
			
			tmpstr = start + tmp.toString(16).toUpperCase() + fim;
			
			IASmem[parseInt(immediate, 16)] = tmpstr;
			
			opval = "STOR MX LEFT";
			
			break;
			
		//STORMXRIGHT
		case "13":
			var tmp = acval & 0x0000000111;
			
			var tmpstr = IASmem[parseInt(immediate, 16)];
			
			var start = tmpstr.slice(0,7);
			
			tmpstr = start + tmp.toString(16).toUpperCase();
			
			IASmem[parseInt(immediate, 16)] = tmpstr;
			
			opval = "STOR MX LEFT";
			
			break;
			
		
		//Fim de programa
		case "":
			end = true;
			opval = "NOP";
			alert("END OF EXECUTION ")
			return;
		
		default:
			end = true;
			opval = "INVALID OP";
			alert("Invalid Opcode" + '/n' + "END OF EXECUTION")
			return;
	}
}

var trueNumbDec = function(number){
	if(number >= 8000000000){
		return -(~(number) + 1);
	}
	else 
		return number;
}

var updateAll = function(){
	document.getElementById("pcOutput").value = pcval.toString(16);
	document.getElementById("acOutput").value = acval.toString(16);
	document.getElementById("mqOutput").value = mqval.toString(16);
	document.getElementById("opOutput").value = opval;
	document.getElementById("logOutput").value = logval;
	
	document.getElementById("logOutput").value = (end ? "DONE" : "-----");
}

