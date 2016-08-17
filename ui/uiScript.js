
var loadMem = function(){
	var txt = document.getElementById("memoryMapEntry").value;
	
	//Removendo espacos e comentarios
	var wdtspace = "";
	var commark = false;
	for(var i = 0; i < txt.length; i++){
		if(txt.charAt(i) == '#')
			commark = true;
		if(txt.charAt(i) == '\n')
			commark = false;
    	if(txt.charAt(i) != ' ' && !commark){
    		wdtspace += txt.charAt(i);
    	}
   	}
   	wdtspace = wdtspace.toUpperCase();
   	
	//adicionando a memoria
	var map ="", j=0;
	for(var i = 0; i < wdtspace.length; i++){
		if(j === 3 || j === 5 || j === 7 || j === 9 || j === 11)
			map += " ";
		map += wdtspace.charAt(i);
		j++;
		if(j>13)
			j=0;		
	}
	console.log(String(map));
	IAS.loadRAM(map);
	updateMem();
};

//Load text to mem
var updateMem = function(){
	document.getElementById("mainMemory1").value = IAS.dumpRAM();
	document.getElementById("mainMemory2").value = IAS.dumpRAM();
};

//Update IAS image
var updateImage = function(phase){
		
	switch (phase){
		case "ftch":
			updateImage("reset");
			document.getElementById("pc_box").style.fill = "#ff5050";
			document.getElementById("pc_mar").style.stroke = "#ff5050";
			document.getElementById("mar_box").style.fill = "#ff5050";
			document.getElementById("main_box").style.fill = "#ff5050";
			document.getElementById("mar_main").style.stroke = "#ff5050";
			document.getElementById("main_mbr").style.stroke = "#ff5050";
			document.getElementById("mbr_box").style.fill = "#ff5050";
			document.getElementById("ir_box").style.fill = "#ff5050";
			document.getElementById("ibr_box").style.fill = "#ff5050";
			document.getElementById("mbr_ir").style.stroke = "#ff5050";
			document.getElementById("mbr_ibr").style.stroke = "#ff5050";
			break;
			
		case "reset":
			document.getElementById("pc_box").style.fill = "#ffffff";
			document.getElementById("pc_mar").style.stroke = "#ffffff";
			document.getElementById("mar_box").style.fill = "#ffffff";
			document.getElementById("main_box").style.fill = "#ffffff";
			document.getElementById("mar_main").style.stroke = "#ffffff";
			document.getElementById("main_mbr").style.stroke = "#ffffff";
			document.getElementById("mbr_box").style.fill = "#ffffff";
			document.getElementById("ir_box").style.fill = "#ffffff";
			document.getElementById("ibr_box").style.fill = "#ffffff";
			document.getElementById("mbr_ir").style.stroke = "#ffffff";
			document.getElementById("mbr_ibr").style.stroke = "#ffffff";
			document.getElementById("control_box").style.fill = "#ffffff";
			document.getElementById("ibr_box").style.fill = "#ffffff";
			document.getElementById("ir_box").style.fill = "#ffffff";
			document.getElementById("ibr_ir").style.stroke = "#ffffff";
			document.getElementById("ir_control").style.stroke = "#ffffff";
			document.getElementById("ac_box").style.fill = "#ffffff";
			document.getElementById("ula_box").style.fill = "#ffffff";
			document.getElementById("ac_ula").style.stroke = "#ffffff";
			document.getElementById("ula_ac").style.stroke = "#ffffff";
			document.getElementById("mq_box").style.fill = "#ffffff";
			document.getElementById("mq_ac").style.stroke = "#ffffff";
			document.getElementById("ula_mq").style.stroke = "#ffffff";
			document.getElementById("mq_ula").style.stroke = "#ffffff";
			document.getElementById("mbr_main").style.stroke = "#ffffff";
			document.getElementById("mbr_ula").style.stroke = "#ffffff";
			document.getElementById("ula_mbr").style.stroke = "#ffffff";
			document.getElementById("mar_pc").style.stroke = "#ffffff";
			break;
		
		case "exec_addsubshift":
			updateImage("reset");
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ibr_box").style.fill = "#0066ff";
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ibr_ir").style.stroke = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ac_ula").style.stroke = "#0066ff";
			document.getElementById("ula_ac").style.stroke = "#0066ff";
			break;
		
		case "exec_loadmq":
			updateImage("reset");
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ibr_box").style.fill = "#0066ff";
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ibr_ir").style.stroke = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("mq_box").style.fill = "#0066ff";
			document.getElementById("mq_ac").style.stroke = "#0066ff";
			break;
		
		case "exec_muldiv":
			updateImage("reset");
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ibr_box").style.fill = "#0066ff";
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ibr_ir").style.stroke = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("mq_box").style.fill = "#0066ff";
			document.getElementById("mq_ac").style.stroke = "#0066ff";
			document.getElementById("ula_mq").style.stroke = "#0066ff";
			document.getElementById("mq_ula").style.stroke = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ac_ula").style.stroke = "#0066ff";
			document.getElementById("ula_ac").style.stroke = "#0066ff";	
			break;
		
		case "exec_ldstr":
			updateImage("reset");
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ibr_box").style.fill = "#0066ff";
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ibr_ir").style.stroke = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ac_ula").style.stroke = "#0066ff";
			document.getElementById("ula_ac").style.stroke = "#0066ff";
			document.getElementById("mbr_box").style.fill = "#0066ff";
			document.getElementById("main_box").style.fill = "#0066ff";
			document.getElementById("main_mbr").style.stroke = "#0066ff";
			document.getElementById("mbr_main").style.stroke = "#0066ff";
			document.getElementById("mbr_ula").style.stroke = "#0066ff";
			document.getElementById("ula_mbr").style.stroke = "#0066ff";
			break;
			
		case "exec_jump":
			updateImage("reset");
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ibr_box").style.fill = "#0066ff";
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ibr_ir").style.stroke = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ac_box").style.fill = "#ff5050";
			document.getElementById("ula_box").style.fill = "#ff5050";
			document.getElementById("ac_ula").style.stroke = "#ff5050";
			document.getElementById("mbr_box").style.fill = "#ff5050";
			document.getElementById("mbr_ir").style.stroke = "#ff5050";
			document.getElementById("ula_mbr").style.stroke = "#ff5050";
			document.getElementById("mar_box").style.fill = "#ff5050";
			document.getElementById("pc_box").style.fill = "#ff5050";
			document.getElementById("mar_pc").style.stroke = "#ff5050";
			break;
			
		case "exec_loadmqm":
			updateImage("reset");
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ibr_box").style.fill = "#0066ff";
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ibr_ir").style.stroke = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("mq_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ula_mq").style.stroke = "#0066ff";
			document.getElementById("mbr_box").style.fill = "#0066ff";
			document.getElementById("main_box").style.fill = "#0066ff";
			document.getElementById("main_mbr").style.stroke = "#0066ff";
			document.getElementById("mbr_main").style.stroke = "#0066ff";
			document.getElementById("mbr_ula").style.stroke = "#0066ff";
			document.getElementById("ula_mbr").style.stroke = "#0066ff";
			break;
	}
};

//Update all interface
var updateAll = function(){
	var operationstr = "";
	
	document.getElementById("pc_out").value = IAS.getCPU("pc", "rawHexNumber").toUpperCase();
	document.getElementById("ac_out").value = IAS.getCPU("ac", "rawHexNumber").toUpperCase();
	document.getElementById("mq_out").value = IAS.getCPU("mq", "rawHexNumber").toUpperCase();
	document.getElementById("ir_out").value = IAS.getCPU("ir", "rawHexNumber").toUpperCase();
	document.getElementById("ibr_out").value = IAS.getCPU("ibr", "rawHexNumber").toUpperCase();
	document.getElementById("mbr_out").value = IAS.getCPU("mbr", "rawHexNumber").toUpperCase();
	document.getElementById("mar_out").value = IAS.getCPU("mar", "rawHexNumber").toUpperCase();
	
	opcd = IAS.getCPU("ir", "leftOpcode");
	
	if(ftc){
		document.getElementById("op_out").value = "FETCH";
		operationstr = "ftch";
	}
	else{
		document.getElementById("op_out").value = IAS.getCPU("ir", "leftOpcodeText").toUpperCase();
		if(opcd = 10){
			operationstr = "exec_loadmq";
		} else if(opcd == 9){
			operationstr = "exec_loadmqm";
		} else if(opcd == 33 || opcd == 1 || opcd == 2 || opcd == 3 || opcd == 22 || opcd == 23){
			operationstr = "exec_ldstr";
		} else if(opcd == 5 || opcd == 6 || opcd == 7 || opcd == 8 || opcd == 24 || opcd == 25){
			operationstr = "exec_addsubshift";
		} else if(opcd == 11 || opcd == 12){
			operationstr = "exec_muldiv";
		}  else if(opcd == 15 || opcd == 16 || opcd == 13 || opcd == 14){
			operationstr = "exec_jump";
		}
	}
	
	updateImage(operationstr);
	updateMem();
};
