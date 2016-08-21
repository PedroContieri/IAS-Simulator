
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
    	if(txt.charAt(i) != ' ' && !commark && txt.charAt(i) != '\t'){
    		wdtspace += txt.charAt(i);
    	}
   	}
   	wdtspace = wdtspace.toUpperCase();
	
   	
	//adicionando a memoria
	var map ="", j=0;
	for(var i = 0; i < wdtspace.length; i++){
		if(wdtspace.charAt(i) != '\n'){
			if(j === 3 || j === 5 || j === 7 || j === 9 || j === 11)
				map += " ";
			map += wdtspace.charAt(i);
			j++;
			if(j>12){
				j=0;
				map += '\n';
			}
		}
	}

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
		case "ftch_left":
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
			
			document.getElementById("ar_pc_mar").style.opacity = "100";
			document.getElementById("ar_mbr_mar").style.opacity = "100";
			document.getElementById("ar_mar_main").style.opacity = "100";
			document.getElementById("ar_main_mbr").style.opacity = "100";
			document.getElementById("ar_mbr_ir").style.opacity = "100";
			document.getElementById("ar_mbr_ibr").style.opacity = "100";
			document.getElementById("ar_mbr_reg").style.opacity = "100";
			break;
		
		case "ftch_right":
			updateImage("reset");
			document.getElementById("ibr_box").style.fill = "#ff5050";
			document.getElementById("ir_box").style.fill = "#ff5050";
			document.getElementById("ibr_ir").style.stroke = "#ff5050";
			document.getElementById("pc_box").style.fill = "#ff5050";
			document.getElementById("mar_box").style.fill = "#ff5050";
			document.getElementById("ibr_mar").style.stroke = "#ff5050";
			
			document.getElementById("ar_ibr_ir").style.opacity = "100";
			document.getElementById("plus_one").style.opacity = "100";
			document.getElementById("plus_pc").style.opacity = "100";
			document.getElementById("ar_ibr_mar").style.opacity = "100";
			break;
			
		case "reset":
			document.getElementById("pc_box").style.fill = "#ffffff";
			document.getElementById("pc_mar").style.stroke = "#000000";
			document.getElementById("mar_box").style.fill = "#ffffff";
			document.getElementById("main_box").style.fill = "#ffffff";
			document.getElementById("mar_main").style.stroke = "#000000";
			document.getElementById("main_mbr").style.stroke = "#000000";
			document.getElementById("mbr_box").style.fill = "#ffffff";
			document.getElementById("ir_box").style.fill = "#ffffff";
			document.getElementById("ibr_box").style.fill = "#ffffff";
			document.getElementById("mbr_ir").style.stroke = "#000000";
			document.getElementById("mbr_ibr").style.stroke = "#000000";
			document.getElementById("control_box").style.fill = "#ffffff";
			document.getElementById("ibr_mar").style.stroke = "#000000";
			document.getElementById("ibr_box").style.fill = "#ffffff";
			document.getElementById("ir_box").style.fill = "#ffffff";
			document.getElementById("ibr_ir").style.stroke = "#000000";
			document.getElementById("ir_control").style.stroke ="#000000";
			document.getElementById("ac_box").style.fill = "#ffffff";
			document.getElementById("ula_box").style.fill = "#ffffff";
			document.getElementById("ac_ula").style.stroke = "#000000";
			document.getElementById("ula_ac").style.stroke = "#000000";
			document.getElementById("mq_box").style.fill = "#ffffff";
			document.getElementById("mq_ac").style.stroke = "#000000";
			document.getElementById("ula_mq").style.stroke = "#000000";
			document.getElementById("mq_ula").style.stroke = "#000000";
			document.getElementById("mbr_main").style.stroke = "#000000";
			document.getElementById("mbr_ula").style.stroke = "#000000";
			document.getElementById("ula_mbr").style.stroke = "#000000";
			document.getElementById("mar_pc").style.stroke = "#000000";
			
			document.getElementById("ar_pc_mar").style.opacity = "0";
			document.getElementById("ar_mar_main").style.opacity = "0";
			document.getElementById("ar_main_mbr").style.opacity = "0";
			document.getElementById("ar_mbr_ir").style.opacity = "0";
			document.getElementById("ar_mbr_ibr").style.opacity = "0";
			document.getElementById("ar_ir_control").style.opacity = "0";
			document.getElementById("ar_ibr_ir").style.opacity = "0";
			document.getElementById("ar_ac_ula").style.opacity = "0";
			document.getElementById("ar_ula_ac").style.opacity = "0";
			document.getElementById("ar_ula_mq").style.opacity = "0";
			document.getElementById("ar_mq_ula").style.opacity = "0";
			document.getElementById("ar_mbr_main").style.opacity = "0";
			document.getElementById("ar_mar_pc").style.opacity = "0";
			document.getElementById("ar_mbr_reg").style.opacity = "0";
			document.getElementById("ar_mbr_ula").style.opacity = "0";
			document.getElementById("ar_ula_mbr").style.opacity = "0";
			document.getElementById("plus_one").style.opacity = "0";
			document.getElementById("plus_pc").style.opacity = "0";
			document.getElementById("control_ula").style.opacity = "0";
			document.getElementById("ar_ibr_mar").style.opacity = "0";
			document.getElementById("ar_mq_ac").style.opacity = "0";
			document.getElementById("ar_mbr_mar").style.opacity = "0";
			break;
		
		case "exec_addsub":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ac_ula").style.stroke = "#0066ff";
			document.getElementById("ula_ac").style.stroke = "#0066ff";
			document.getElementById("mbr_box").style.fill = "#0066ff";
			document.getElementById("main_box").style.fill = "#0066ff";
			document.getElementById("main_mbr").style.stroke = "#0066ff";
			document.getElementById("mbr_ula").style.stroke = "#0066ff";
			document.getElementById("mar_box").style.fill = "#0066ff";
			document.getElementById("mar_main").style.stroke = "#0066ff";
			
			document.getElementById("ar_mbr_ula").style.opacity = "100";
			document.getElementById("ar_main_mbr").style.opacity = "100";
			document.getElementById("ar_ac_ula").style.opacity = "100";
			document.getElementById("ar_ula_ac").style.opacity = "100";
			document.getElementById("control_ula").style.opacity = "100";
			document.getElementById("ar_mar_main").style.opacity = "100";
			break;
		
		case "exec_loadmq":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("mq_box").style.fill = "#0066ff";
			document.getElementById("mq_ac").style.stroke = "#0066ff";
			
			document.getElementById("ar_mq_ac").style.opacity = "100";
			break;
		
		case "exec_muldiv":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("mq_box").style.fill = "#0066ff";
			document.getElementById("mq_ac").style.stroke = "#0066ff";
			document.getElementById("ula_mq").style.stroke = "#0066ff";
			document.getElementById("mq_ula").style.stroke = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ula_ac").style.stroke = "#0066ff";	
			document.getElementById("mbr_box").style.fill = "#0066ff";
			document.getElementById("main_box").style.fill = "#0066ff";
			document.getElementById("mar_box").style.fill = "#0066ff";
			document.getElementById("mar_main").style.stroke = "#0066ff";
			document.getElementById("main_mbr").style.stroke = "#0066ff";
			document.getElementById("mbr_ula").style.stroke = "#0066ff";
			
			document.getElementById("ar_mbr_ula").style.opacity = "100";
			document.getElementById("ar_main_mbr").style.opacity = "100";
			document.getElementById("ar_ula_mq").style.opacity = "100";
			document.getElementById("ar_mq_ula").style.opacity = "100";
			document.getElementById("ar_ula_ac").style.opacity = "100";
			document.getElementById("ar_mar_main").style.opacity = "100";
			document.getElementById("control_ula").style.opacity = "100";
			break;
		
		case "exec_ld":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ula_ac").style.stroke = "#0066ff";
			document.getElementById("mbr_box").style.fill = "#0066ff";
			document.getElementById("main_box").style.fill = "#0066ff";
			document.getElementById("main_mbr").style.stroke = "#0066ff";
			document.getElementById("mbr_ula").style.stroke = "#0066ff";
			document.getElementById("mar_box").style.fill = "#0066ff";
			document.getElementById("mar_main").style.stroke = "#0066ff";
			
			document.getElementById("ar_ula_ac").style.opacity = "100";
			document.getElementById("ar_main_mbr").style.opacity = "100";
			document.getElementById("ar_mbr_ula").style.opacity = "100";
			document.getElementById("control_ula").style.opacity = "100";
			document.getElementById("ar_mar_main").style.opacity = "100";
			break;
			
		case "exec_str":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ac_ula").style.stroke = "#0066ff";
			document.getElementById("mbr_box").style.fill = "#0066ff";
			document.getElementById("main_box").style.fill = "#0066ff";
			document.getElementById("mbr_main").style.stroke = "#0066ff";
			document.getElementById("ula_mbr").style.stroke = "#0066ff";
			document.getElementById("mar_box").style.fill = "#0066ff";
			document.getElementById("mar_main").style.stroke = "#0066ff";
			
			document.getElementById("ar_ac_ula").style.opacity = "100";
			document.getElementById("ar_mbr_main").style.opacity = "100";
			document.getElementById("ar_ula_mbr").style.opacity = "100";
			document.getElementById("control_ula").style.opacity = "100";
			document.getElementById("ar_mar_main").style.opacity = "100";
			break;
			
		case "exec_jump":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ac_box").style.fill = "#ff5050";
			document.getElementById("ula_box").style.fill = "#ff5050";
			document.getElementById("ac_ula").style.stroke = "#ff5050";
			document.getElementById("mar_box").style.fill = "#ff5050";
			document.getElementById("pc_box").style.fill = "#ff5050";
			document.getElementById("mar_pc").style.stroke = "#ff5050";
			
			document.getElementById("ar_ac_ula").style.opacity = "100";
			document.getElementById("ar_mar_pc").style.opacity = "100";
			document.getElementById("control_ula").style.opacity = "100";
			break;
		
		case "exec_shift":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("ac_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ac_ula").style.stroke = "#0066ff";
			
			document.getElementById("ar_ac_ula").style.opacity = "100";
			document.getElementById("ar_ula_ac").style.opacity = "100";
			document.getElementById("control_ula").style.opacity = "100";			
			break;
			
		case "exec_loadmqm":
			updateImage("reset");
			document.getElementById("ir_box").style.fill = "#0066ff";
			document.getElementById("ir_control").style.stroke = "#0066ff";
			document.getElementById("ar_ir_control").style.opacity = "100";
			document.getElementById("control_box").style.fill = "#0066ff";
			document.getElementById("mq_box").style.fill = "#0066ff";
			document.getElementById("ula_box").style.fill = "#0066ff";
			document.getElementById("ula_mq").style.stroke = "#0066ff";
			document.getElementById("mbr_box").style.fill = "#0066ff";
			document.getElementById("main_box").style.fill = "#0066ff";
			document.getElementById("main_mbr").style.stroke = "#0066ff";
			document.getElementById("mbr_ula").style.stroke = "#0066ff";
			document.getElementById("mar_box").style.fill = "#0066ff";
			document.getElementById("mar_main").style.stroke = "#0066ff";
			
			document.getElementById("ar_ula_mq").style.opacity = "100";
			document.getElementById("ar_main_mbr").style.opacity = "100";
			document.getElementById("ar_mbr_ula").style.opacity = "100";
			document.getElementById("control_ula").style.opacity = "100";
			document.getElementById("ar_mar_main").style.opacity = "100";
			break;
	}
};

//Update all interface
var updateAll = function(){
	var operationstr = "";
	
	document.getElementById("ir_out").value = IAS.getCPU("ir", "leftOpcodeHex").toUpperCase();
	document.getElementById("pc_out").value = IAS.getCPU("pc", "leftAddrHex").toUpperCase();
	document.getElementById("mar_out").value = IAS.getCPU("mar", "leftAddrHex").toUpperCase();
	document.getElementById("ibr_out").value = IAS.getCPU("ibr", "rightInstructionHex").toUpperCase();
	document.getElementById("mbr_out").value = IAS.getCPU("mbr", "wordValueHex").toUpperCase();
	document.getElementById("ac_out").value = IAS.getCPU("ac", "wordValueHex").toUpperCase();
	document.getElementById("mq_out").value = IAS.getCPU("mq", "wordValueHex").toUpperCase();
	
	if(!ftc){
	    if(ftcstate == "left_fetch"){										//corrigir a função desta linha
		document.getElementById("cycle_out").value = "FETCH LEFT";
	    } else {
		document.getElementById("cycle_out").value = "FETCH RIGHT";
	    }
	}
        else{
	    document.getElementById("cycle_out").value = "EXECUTE";
	}

        opcd = IAS.getCPU("ir", "leftOpcode");

        document.getElementById("op_out").value = IAS.getCPU("ir", "leftOpcodeText").toUpperCase();
        operationstr = "???";
        if(opcd == 10){
	    operationstr = "exec_loadmq";
	} else if(opcd == 9){
	    operationstr = "exec_loadmqm";
	} else if( opcd == 0x1 || opcd == 0x2 || opcd == 0x3){
	    operationstr = "exec_ld";
	} else if(opcd == 0x12 || opcd == 0x13 || opcd == 0x21){
	    operationstr = "exec_str";
	} else if(opcd == 5 || opcd == 6 || opcd == 7 || opcd == 8 ){
	    operationstr = "exec_addsub";
	} else if(opcd == 0x14 || opcd == 0x15){
	    operationstr = "exec_shift";
	} else if(opcd == 11 || opcd == 12){
	    operationstr = "exec_muldiv";
	}  else if(opcd == 15 || opcd == 16 || opcd == 13 || opcd == 14){
	    operationstr = "exec_jump";
	}

        updateImage(operationstr);
	updateMem();
};
