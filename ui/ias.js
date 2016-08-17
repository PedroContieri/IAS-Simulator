var IAS = (function () {

	// default initialization code
	// constants
	var RAM_SIZE = 1024; // words in memory
	var POW_OF_2 = []; // unfortunately we can't rely on bitwise ops (they convert to 32 bit integer)
	for (i = 0, p = 1; i <= 40; i++, p *= 2) {
		POW_OF_2[i] = p;
	}

	// registers and memory
	var reg = {};
	reg.ctrl = "left_fetch";
	reg.ir = 0; // 8 bit
	reg.pc = reg.mar = 0; // 12 bit
	reg.ibr = 0; // 20 bit
	reg.mbr = reg.ac = reg.mq = 0; // 40 bit

	var ram = [];
	for (i = 0; i < RAM_SIZE; i++) {
		ram[i] = Math.floor(Math.random() * POW_OF_2[40]); // crazy RAM initialization
	}

	// return value's "bits" from lsb to lsb+numbits-1 (convention: lsb 0)
	// bits requested should be in range 0-39
	var selectBits = function (value, lsb, numbits) { 
		return Math.floor(value / POW_OF_2[lsb]) % POW_OF_2[numbits];
	};

	// left pads str with amt padchars
	var leftPadWithChar = function (str, padchars, amt) {
		var result = "";
		for (var i = 0; i < amt; i++) {
			result += padchars;
		}
		return result + str;
	}

	// validation functions that throw exceptions:
	// makes sure that we are fetching an instruction from a valid address
	var validateInstructionFetch = function () {
		if (typeof ram[reg.pc] !== "number") { // if it's not a valid (initialized) position in RAM
			throw {
				name: "invalidFetch",
				message: "Attempt to fetch an instruction at an invalid address:\n" +
					     "0x" + reg.pc.toString(16).toUpperCase()
			};
		}
		validateDataRange(reg.pc);
	};

	// make sure we are accessing a valid address in RAM
	var validateDataAccess = function (addr) {
		if (typeof ram[addr] !== "number") { // if it's not a valid (initialized) position in RAM
			throw {
				name: "invalidAccess",
				message: "Attempt to access data at an invalid address:\n" +
					     "0x" + addr.toString(16).toUpperCase()
			};
		}
		validateDataRange(addr);
	};

	// make sure memory value is an integer in the appropriate range
	var validateDataRange = function (addr) { // defensive debugging
		if (ram[addr] < 0 || ram[addr] >= POW_OF_2[40] || ram[addr] !== Math.floor(ram[addr])) {
			throw {
				name: "invalidData",
				message: "Attempt to access invalid data\n" +
				         ram[addr] + "\nat address\n" +
				         "0x" + addr.toString(16).toUpperCase()
			};
		}
	}

	// make sure memory value is an integer in the appropriate range
	var validateNumRange = function (num, range) { // defensive debugging
		if (num < 0 || num >= range || num !== Math.floor(num)) {
			throw {
				name: "invalidNumber",
				message: "Attempt to use a number that's out of bounds:\n" +
				         num + "\nnot in range [0, " + range + ")"
			};
		}
	}

	// valid memory/register attributes for getRAM, setRAM, getCPU queries. case insensitive
	var opcode_register_props = { // IR attributes
		leftopcode: true,
		leftopcodeHex: true,
		leftopcodeText: true,
		rightopcode: true,
		rightopcodehex: true,
		rightopcodetext: true,
	};
	var addr_register_props = { // MAR and PC attributes
		leftaddr: true,
		leftaddrhex: true,
		rightaddr: true,
		rightaddrhex: true
	};
	var fortybit_register_props = { // other registers and memory
		leftopcode: true,
		leftopcodehex: true,
		leftopcodetext: true,
		leftaddr: true,
		leftaddrhex: true,
		leftinstruction: true,
		leftinstructionhex: true,
		leftinstructiontext: true,
		rightopcode: true,
		rightopcodehex: true,
		rightopcodetext: true,
		rightaddr: true,
		rightaddrhex: true,
		rightinstruction: true,
		rightinstructionhex: true,
		rightinstructiontext: true,
		number: true,
		rawhexnumber: true
	}
	var registers_to_prop = {
		ir: opcode_register_props,
		mar: addr_register_props,
		pc: addr_register_props,
		ibr: fortybit_register_props,
		mbr: fortybit_register_props,
		ac: fortybit_register_props,
		mq: fortybit_register_props
	};

	// returns an object with all possible attributes of a 40 bit word
	var getWordAttributes = function (word, property) {

		var blankinstruction = "                    "; // 20 spaces
		var attributes = {};

		attributes.leftopcode = selectBits(word, 32, 8);
		attributes.leftopcodehex = attributes.leftopcode.toString(16).toUpperCase();
		attributes.leftopcodetext = instructions[leftopcode] !== undefined ? instructions[leftopcode].name : blankinstruction;

		attributes.rightopcode = selectBits(word, 12, 8);
		attributes.rightopcodehex = attributes.rightopcode.toString(16).toUpperCase();
		attributes.rightopcodetext = instructions[rightopcode] !== undefined ? instructions[rightopcode].name : blankinstruction;

		attributes.leftaddr = selectBits(word, 20, 12);
		attributes.leftaddrhex = attributes.leftAddr.toString(16).toUpperCase();

		attributes.rightaddr = selectBits(word, 0, 12);
		attributes.rightaddrhex = attributes.rightaddr.toString(16).toUpperCase();

		attributes.leftinstruction = selectBits(word, 20, 20);
		attributes.leftinstructionhex = attributes.leftInstruction.toString(16).toUpperCase();
		attributes.leftinstructiontext = instructions[leftopcode] !== undefined ? instructions[leftopcode].name.replace('X', "0x" + attributes.leftaddrhex) : blankinstruction;

		attributes.rightinstruction = selectBits(word, 0, 20);
		attributes.rightinstructionhex = attributes.rightinstruction.toString(16).toUpperCase();
		attributes.rightinstructiontext = instructions[rightopcode] !== undefined ? instructions[rightopcode].name.replace('X', "0x" + attributes.rightaddrhex) : blankinstruction;

		attributes.number = word >= POW_OF_2[39] ? POW_OF_2[40] - word : word; // if word is negative, get the 2's complement
		attributes.rawhexnumber = word.toString(16).toUpperCase();

		return attributes;
	};



	// all known IAS instructions:
	var instructions = []
	instructions[1] = {
		name: "LOAD M(X)",
		execute: function () {
			validateDataAccess(reg.mar);
			reg.mbr = ram[reg.mar];
			reg.ac = reg.mbr;
		}
	};
	instructions[2] = {
		name: "LOAD -M(X)",
		execute: function () {
			validateDataAccess(reg.mar);
			reg.mbr = ram[reg.mar];
			reg.ac = (POW_OF_2[40] - reg.mbr) % POW_OF_2[40];
		}
	};
	instructions[3] = {
		name: "LOAD |M(X)|",
		execute: function () {
			validateDataAccess(reg.mar);
			reg.ac = reg.mbr = ram[reg.mar];
			if (reg.mbr >= POW_OF_2[39]) { // if the number is negative
				reg.ac = POW_OF_2[40] - reg.ac; // then negate it
			}
		}
	};
	instructions[5] = {
		name: "ADD M(X)",
		execute: function () {
			validateDataAccess(reg.mar);
			reg.mbr = ram[reg.mar]
			reg.ac = (reg.ac + reg.mbr) % POW_OF_2[40];
		}
	};
	instructions[6] = {
		name: "SUB M(X)",
		execute: function () {
			validateDataAccess(reg.mar);
			reg.mbr = ram[reg.mar]
			reg.ac = (reg.ac + POW_OF_2[40] - reg.mbr) % POW_OF_2[40];
		}
	};
	instructions[7] = {
		name: "ADD |M(X)|",
		execute: function () {
			validateDataAccess(reg.mar);
			var tmp;
			tmp = reg.mbr = ram[reg.mar];
			if (reg.mbr >= POW_OF_2[39]) { // if the number is negative
				tmp = POW_OF_2[40] - reg.mbr; // then negate it
			}
			reg.ac = (reg.ac + tmp) % POW_OF_2[40];
		}
	};
	instructions[8] = {
		name: "SUB |M(X)|",
		execute: function () {
			validateDataAccess(reg.mar);
			var tmp;
			tmp = reg.mbr = ram[reg.mar];
			if (reg.mbr < POW_OF_2[39]) { // if the number is positive
				tmp = POW_OF_2[40] - reg.mbr; // then negate it
			}
			reg.ac = (reg.ac + tmp) % POW_OF_2[40];
		}
	};
	instructions[9] = {
		name: "LOAD MQ,M(X)",
		execute: function () {
			validateDataAccess(reg.mar);
			reg.mbr = ram[reg.mar];
			reg.mq = reg.mbr;
		}
	};
	instructions[10] = {
		name: "LOAD MQ",
		execute: function () {
			reg.ac = reg.mq;
		}
	};
	instructions[11] = { // signed multiplication: AC:MQ (in 2's complement) <- MQ * MEM[X] (also in 2's complement)
		name: "MUL M(X)",
		execute: function () {
			// reduce to unsigned multiplication with two 20 bit chunks. can you come up with a more elegant way?
			validateDataAccess(reg.mar);
			var tmp;
			tmp = reg.mbr = ram[reg.mar];
			var sign = 1;
			if (reg.mq >= POW_OF_2[39]) { // if MQ is negative
				sign *= -1;
				reg.mq = POW_OF_2[40] - reg.mq; // negate it
			}
			if (tmp >= POW_OF_2[39]) { // if memory operand is negative
				sign *= -1;
				tmp = POW_OF_2[40] - tmp; // negate it
			}

			var uppermq = selectBits(mq, 20, 20);
			var lowermq = selectBits(mq, 0, 20);
			var uppermem = selectBits(tmp, 20, 20);
			var lowermem = selectBits(tmp, 0, 0);

			reg.ac = uppermq * uppermem; // AC takes the upper 40 bits
			reg.mq = lowermq * lowermem; // MQ takes the lower 40 bits
			tmp = uppermq * lowermem;
			var tmp2 = uppermem * lowermq;
			reg.ac += selectBits(tmp, 20, 20) + selectBits(tmp2, 20, 20); // upper half of cross terms goes into  most significant register
			reg.mq += POW_OF_2[20] * (selectBits(tmp,  0, 20) + selectBits(tmp2,  0, 20)); // lower half of cross terms goes into least significant register
			// can we really get a carry in the lower register? i'm putting this just in case:
			if (reg.mq >= POW_OF_2[40]) { // if we get a carry in MQ
				console.log("we got a carry of 0x" + Math.floor(reg.mq / POW_OF_2[40]).toString(16).toUpperCase() + " during a MUL M(X) op"); // debug
				reg.ac += Math.floor(reg.mq / POW_OF_2[40]); // bits that carried go to the upper register
				reg.mq = reg.mq % POW_OF_2[40];
			}
			if (sign === -1) { // if the result is negative, we'll akwardly obtain the 2's complement of AC:MQ. spec isn't clear. 2's complement doesn't make much sense for multi-word arith
				if (reg.mq !== 0) { // if the lower register won't carry
					reg.mq--;
				} else { // we have a carry
					reg.ac--;
				}
				reg.ac = POW_OF_2[40] - 1 - reg.ac; // one's complement the registers
				reg.mq = POW_OF_2[40] - 1 - reg.mq;
			}
		}
	};
	instructions[12] = { // signed divide: MQ <- AC / MEM[X], AC <- AC % MEM[X]
		name: "DIV M(X)", // quotient rounds towards zero, remainder assumes the sign of the dividend
		execute: function () {
			// reduces to an unsigned division
			validateDataAccess(reg.mar);
			var tmp;
			tmp = reg.mbr = ram[reg.mar];
			if (tmp === 0) { // division by zero
				throw {
					name: "arithmeticException",
					message: "Attempt to divide by zero from value at address 0x" +
					         reg.mar.toString(16).toUpperCase()
				};
			}
			var sign = 1;
			if (reg.ac >= POW_OF_2[39]) { // if MQ is negative
				sign *= -1;
				reg.ac = POW_OF_2[40] - reg.ac; // negate it
			}
			if (tmp >= POW_OF_2[39]) { // if memory operand is negative
				sign *= -1;
				tmp = POW_OF_2[40] - tmp; // negate it
			}
			reg.mq = Math.floor(reg.ac / tmp); // MQ takes the quotient
			if (sign === -1) {
				reg.mq = POW_OF_2[40] - reg.mq; // quotient is negative
			}
			if (reg.ac >= POW_OF_2[39]) { // if the dividend is negative
				reg.ac = reg.ac % tmp;
				reg.ac = POW_OF_2[40] - reg.ac; // negate the remainder
			} else {
				reg.ac = reg.ac % tmp;
			}
		}
	};
	instructions[13] = {
		name: "JUMP M(X,0:19)", // bit convention: MSB 0
		execute: function () {
			reg.pc = reg.mar;
			reg.ctrl = "left_fetch";
		}
	};
	instructions[14] = {
		name: "JUMP M(X,20:39)",
		execute: function () {
			reg.pc = reg.mar;
			reg.ctrl = "right_fetch_RAM";
		}
	};
	instructions[15] = {
		name: "JUMP+ M(X,0:19)",
		execute: function () {
			if (reg.ac < POW_OF_2[39]) { // if AC is non negative, we jump
				reg.pc = reg.mar;
				reg.ctrl = "left_fetch";
			}
		}
	};
	instructions[16] = {
		name: "JUMP+ M(X,20:39)",
		execute: function () {
			if (reg.ac < POW_OF_2[39]) { // if AC is non negative, we jump
				reg.pc = reg.mar;
				reg.ctrl = "right_fetch_RAM";
			}
		}
	};
	instructions[18] = {
		name: "STOR M(X,8:19)",
		execute: function () {
			// replace address field of left instruction in memory by corresponding field of AC
			validateDataAccess(reg.mar);
			reg.mbr = POW_OF_2[20] * selectBits(reg.ac, 20, 12); // tranfer the left address field of AC to MBR for mem write. everything else is zero
			var addr_field = POW_OF_2[20] * selectBits(ram[reg.mar], 20, 12);
			ram[reg.mar] += reg.mbr - addr_field; // replaces the original address field in memory with the one in MBR
		}
	};
	instructions[19] = {
		name: "STOR M(X,28:39)",
		execute: function () {
			// replace address field of right instruction in memory by corresponding field of AC
			validateDataAccess(reg.mar);
			reg.mbr = selectBits(reg.ac, 0, 12); // tranfer the right address field of AC to MBR for mem write. everything else is zero
			var addr_field = selectBits(ram[reg.mar], 0, 12);
			ram[reg.mar] += reg.mbr - addr_field; // replaces the original address field in memory with the one in MBR
		}
	};
	instructions[21] = {
		name: "RSH",
		execute: function () {
			reg.ac = Math.floor(reg.ac / 2);
		}
	};
	instructions[22] = {
		name: "LSH",
		execute: function () {
			reg.ac = (reg.ac * 2) % POW_OF_2[40];
		}
	};
	instructions[33] = {
		name: "STOR M(X)",
		execute: function () {
			validateDataAccess(reg.mar);
			ram[reg.mar] = reg.mbr = reg.ac;
		}
	};


	// IAS public methods:
	return {

		reset: function () {
			reg.ctrl = "left_fetch";
			reg.pc = 0;
		},

		fetch: function () {
			
			if (reg.ctrl === "left_fetch") {
				validateInstructionFetch();
				reg.mar = reg.pc;
				reg.mbr = ram[reg.mar];
				reg.ir = selectBits(reg.mbr, 32, 8);
				reg.mar = selectBits(reg.mbr, 20, 12);
				reg.ibr = selectBits(reg.mbr, 0, 20);
				reg.ctrl = "left_execute";
			} else if (reg.ctrl === "right_fetch") {
				reg.ir = selectBits(reg.ibr, 12, 8);
				reg.mar = selectBits(reg.ibr, 0, 12);
				reg.pc++;
				reg.ctrl = "right_execute";
			} else if (reg.ctrl === "right_fetch_RAM") { // after a jump
				validateInstructionFetch();
				reg.mar = reg.pc;
				reg.mbr = ram[reg.mar];
				reg.ir = selectBits(reg.mbr, 12, 8);
				reg.mar = selectBits(reg.mbr, 0, 12);
				reg.pc++;
				reg.ctrl = "right_execute";
			} else {
				throw {
					name: "invalidFetch",
					message: "Invalid attempt to fetch an instruction during an execute cycle"
				};
			}

		},

		execute: function () {

			if (reg.ctrl.indexOf("execute") === -1) { // if not an execute cycle
				throw {
					name: "invalidExecution",
					message: "invalid attempt to execute an instruction during a fetch cycle"
				};
			}
			
			if (typeof instructions[reg.ir].execute === "function") { // if the instruction exists
				instructions[reg.ir].execute();

				// now make sure we will execute the correct fetch cycle:
				if (instructions[reg.ir].name.indexOf("JUMP") === -1) { // if it's not a jump instruction
					if (reg.ctrl === "left_execute") {
						reg.ctrl = "right_fetch";
					} else { // we executed an instruction at the right
						reg.ctrl = "left_fetch";
					}
				}
				// else if it is a jump instruction, then we take care of it at the specific instruction's code
				
			} else { // non existent opcode
				throw {
					name: "invalidInstruction",
					message: "Attempt to execute a non-existent instruction with opcode\n" +
						     reg.ir + " at address \n0x" + 
						     (reg.ctrl === "left_execute" ? reg.pc : reg.pc-1).toString(16).toUpperCase()
				}; // note: IAS handout says we should increment PC only in the right fetch cycle - hence the check above
			}

		},

		getRAM: function (addr, prop) {
			validateDataAccess(addr);
			var attributes = getWordAttribute(ram[addr]);
			prop = prop.toLowerCase();
			if (attributes[prop] === undefined) { // if prop is not a valid property for a 40 bit word
				throw {
					name: "invalidMemoryAttribute",
					message: "The specified attribute " + prop + " is not valid for a 40 bit word in RAM"
				};
			}
			return attributes[prop];
		},


		getCPU: function (register, prop) {
			register = register.toLowerCase();
			prop = prop.toLowerCase();
			if (reg[register] === undefined) { // if there is no such register
				throw {
					name: "invalidRegister",
					message: "Specified register " + register + " is not part of the IAS architecture"
				};
			}
			if (registers_to_prop[register][prop] === undefined) { // if prop is not a valid property for the selected register
				throw {
					name: "invalidCPURegisterAttribute",
					message: "The specified attribute " + prop + " is not valid for the register " + register
				};
			}
			var word = reg[register];
			if (register === "ibr" || register === "pc" || register === "mar") { // IBR is duplicated (left and right instructions are one and the same). for the address registers, duplication works as well
				word = word + POW_OF_2[20]*word;
			} else if (register === "ir") { // shift and duplicate so left and right opcodes (which are the same) are available
				word *= POW_OF_2[12]; // shift
				word = word + POW_OF_2[20]*word;
			}
			if (register === "ctrl") { // CTRL is just the fetch/execute cycle state
				return reg.ctrl;
			}
			return getWordAttributes(word)[prop]; // return the desired property
		},


		setRAM: function (addr, prop, value) {

			prop = prop.toLowerCase();
			if (fortybit_register_props[prop] === undefined) { // if the property doesn't exist
				throw {
					name: "invalidMemoryAttribute",
					message: "The specified attribute " + prop + " is not valid for a 40 bit word in RAM"
				};
			}
			if (prop.indexOf("text") !== -1) { // if this is one of the 'Text' properties
				throw {
					name: "memoryAttributeNotSupported",
					message: "The specified attribute " + prop + " is not currently supported for memory write operations"
				};
			}

			validateDataAccess(addr);
			var word = ram[addr];
			var lsb = 0, numbits = 40;

			if (prop.indexOf("opcode") !== -1) { // if it's an opcode attribute
				lsb += 12; // position to read opcode field
				numbits = 8; // 8 bit address field
			}
			if (prop.indexOf("left") !== -1) { // if it's a left attribute
				lsb += 20; // position to read left field
			}
			if (prop.indexOf("addr") !== -1) { // if it's an address attribute
				numbits += 12; // 12 bit address field
			}
			if (prop.indexOf("instruction") !== -1) { // if it's an instruction attribute
				numbits = 20; // 20 bit instruction field
			}
			var field = selectBits(word, lsb, numbits);

			if (prop.indexOf("hex") !== -1) { // if we were passed a hex string
				value = parseInt(value, 16);
			}
			if (value < 0) {
				value = POW_OF_2[40] - value; // 2's complement it
			}
			validateNumRange(value, POW_OF_2[numbits]);

			word = word - field + POW_OF_2[lsb] * value; // replace field with the new value
			ram[addr] = word; // write the replaced value to memory	

		},

		// dumps CPU information
		dumpCPU: function () {
			var attributesIR = getWordAttributes(reg.ir * POW_OF_2[12]); // put IR's "opcode field" in place so we can read it
			var attributesMAR = getWordAttributes(reg.mar);
			var attributesPC = getWordAttributes(reg.pc);
			var attributesIBR = getWordAttributes(reg.ibr);
			var attributesMBR = getWordAttributes(reg.mbr);
			var attributesAC = getWordAttributes(reg.ac);
			var attributesMQ = getWordAttributes(reg.mq);
			return "IAS" +
				   "CTRL: " + reg.ctrl + "\n" +
				   "IR: " + "0x" + attributesIR.rightopcodehex + "\t" + attributesIR.rightopcode + "\t" + attributesIR.rightopcodetext + "\n" +
				   "MAR: " + "0x" + attributesMAR.rightaddrhex + "\t" + attributesMAR.rightaddr + "\n" +
				   "PC: " + "0x" + attributesPC.rightaddrhex + "\t" + attributesPC.rightaddr + "\n" +
				   "IBR: " + "0x" + attributesIBR.rightopcodehex + " " + attributesIR.rightaddrhex + "\t" + attributesIR.rightinstructiontext + "\n" +
				   "MBR: " + "0x" + attributesMBR.leftopcodehex + " " + attributesMBR.leftaddrhex + " " + attributesMBR.leftinstructiontext + "\t" + attributesMBR.rightopcodehex + " " + attributesMBR.rightaddrhex + " " + attributesMBR.rightinstructiontext + "\n" +
				   "AC: " + "0x" + attributesAC.rawhexnumber + "\t" + attributesAC.number + "\n" +
				   "MQ: " + "0x" + attributesMQ.rawhexnumber + "\t" + attributesMQ.number + "\n";
				   
		},

		// returns a memory map (i.e. 000 ab cd ef 01 02\n 001 cc dd ee ff aa\n ...etc...)
		dumpRAM: function () {
			var map = ""; // is there a more efficient way to do it JS than by string concatenation?
			var ADDRDIGITS = 3; // our address field is 3 digits wide
		
			for (var i = 0; i < RAM_SIZE; i++) {
				var addr = i.toString(16);
				var line = leftPadWithChar(addr, "0", (ADDRDIGITS - addr.length)); // left pad the address field with zeroes
				line += "\t";
				var word = ram[i];
				var f1 = selectBits(word, 32, 8).toString(16);
				var f2 = selectBits(word, 20, 12).toString(16);
				var f3 = selectBits(word, 12, 8).toString(16);
				var f4 = selectBits(word, 0, 12).toString(16);

				line += leftPadWithChar(f1, "0", 2-f1.length) + " "; // opcode field: 2 digits wide
				line += leftPadWithChar(f2, "0", 3-f2.length) + " "; // address field: 3 digits wide
				line += leftPadWithChar(f3, "0", 2-f3.length) + " ";
				line += leftPadWithChar(f4, "0", 3-f4.length) + "\n";

				map += line.toUpperCase();
			}
			return map;
		},

		// uses a memory map to insert values into RAM
		// (i.e. 000 ab cd ef 01 02\n 001 cc dd ee ff aa\n ...etc...)
		loadRAM: function (map) {
			var lines = map.split("\n"); // process each line corresponding to a word in memory
			var re = /^[\s]*([0-9a-f]+)\s+([0-9a-f][0-9a-f\s]*)$/i; // match a line: an address followed by hex numbers. whitespace only mandatory for separating the address and the memory value
			var whitespace = /[\s]/g;
			for (var i = 0; i < lines.length; i++) {
				var m = lines[i].match(re); // capture 1: addr. capture 2: number (with possible whitespace interspersed)
				if (m === null) { // if the line does match our pattern
					throw {
						name: "invalidMap",
						message: "Line " + (i+1) + " of the memory map is not in the valid format:\n" +
						         "<address> <number> [#comment]" + "\n" +
						         ", where <number> may have any amount of whitespaces, and comments are optional"
					};
				}
				var addr = parseInt(m[1], 16);
				var number = parseInt(m[2].replace(whitespace, ""), 16); // skip whitespace
				validateDataAccess(addr); // make sure address and number matched are in valid range
				validateNumRange(number, POW_OF_2[40]);
				ram[addr] = number;
			}
		}


	};

	

}) ();