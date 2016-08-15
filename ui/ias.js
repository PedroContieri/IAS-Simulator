var IAS = (function () {

	// default initialization code

	var i, j, k, p, q, r, s; // various temps
	
	var RAM_SIZE = 1024; // words in memory
	var POW_OF_2 = []; // unfortunately we can't rely on bitwise ops (they convert to 32 bit integer)
	for (i = 0, p = 1; i <= 40; i++, p *= 2) {
		POW_OF_2[i] = p;
	}

	
	var reg = {};
	reg.ctrl = "left_fetch";
	reg.ir = 0; // 8 bit
	reg.pc = reg.mar = 0; // 12 bit
	reg.ibr = 0; // 20 bit
	reg.mbr reg.ac = reg.mq = 0; // 40 bit

	var ram = [];
	for (i = 0; i < RAM_SIZE; i++) {
		ram[i] = Math.floor(Math.random() * POW_OF_2[40]); // crazy RAM initialization
	}

	// return "bits" lsb to lsb+numbits-1 of value (convention: lsb 0)
	// bits requested should be in range 0-39
	var selectBits = function (value, lsb, numbits) { 
		return Math.floor(value / POW_OF_2[lsb]) % POW_OF_2[numbits];
	};

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

	var validateNumRange = function (num, range) { // defensive debugging
		if (num < 0 || num >= range || num !== Math.floor(num)) {
			throw {
				name: "invalidNumber",
				message: "Attempt to use a number that's out of bounds:\n" +
				         num + "\nnot in range [0, " + range + ")"
			};
		}
	}

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
			reg.mq = Math.floor(reg.ac / tmp)); // MQ takes the quotient
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

	var opcode_register_props = {
		leftOpcode: 1,
		leftOpcodeHex: 1,
		leftOpcodeText: 1,
		rightOpcode: 1,
		rightOpcodeHex: 1,
		rightOpcodeText: 1,
	};
	var addr_register_props = {
		leftAddr: 1,
		leftAddrHex: 1,
		rightAddr: 1,
		rightAddrHex: 1
	};
	var fortybit_register_props = {
		leftOpcode: 1,
		leftOpcodeHex: 1,
		leftOpcodeText: 1,
		leftAddr: 1,
		leftAddrHex: 1,
		leftInstruction: 1,
		leftInstructionHex: 1,
		leftInstructionText: 1,
		rightOpcode: 1,
		rightOpcodeHex: 1,
		rightOpcodeText: 1,
		rightAddr: 1,
		rightAddrHex: 1,
		rightInstruction: 1,
		rightInstructionHex: 1,
		rightInstructionText: 1,
		number: 1,
		rawHexNumber: 1
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

	// TO DO
	var getWordAttribute = function (word, property) {

		var blankinstruction = "                    "; // 20 spaces
		var attributes = {};

		attributes.leftOpcode = selectBits(word, 32, 8);
		attributes.leftOpcodeHex = attributes.leftOpcode.toString(16).toUpperCase();
		attributes.leftOpcodeText = instructions[leftOpcode] !== undefined ? instructions[leftOpcode].name : blankinstruction;

		attributes.rightOpcode = selectBits(word, 12, 8);
		attributes.rightOpcodeHex = attributes.rightOpcode.toString(16).toUpperCase();
		attributes.rightOpcodeText = instructions[rightOpcode] !== undefined ? instructions[rightOpcode].name : blankinstruction;

		attributes.leftAddr = selectBits(word, 20, 12);
		attributes.leftAddrHex = attributes.leftAddr.toString(16).toUpperCase();

		attributes.rightAddr = selectBits(word, 0, 12);
		attributes.rightAddrHex = attributes.rightAddr.toString(16).toUpperCase();

		attributes.leftInstruction = selectBits(word, 20, 20);
		attributes.leftInstructionHex = attributes.leftInstruction.toString(16).toUpperCase();
		attributes.leftInstructionText = instructions[leftOpcode] !== undefined ? instructions[leftOpcode].name.replace('X', "0x" + attributes.leftAddrHex) : blankinstruction;

		attributes.rightInstruction = selectBits(word, 0, 20);
		attributes.rightInstructionHex = attributes.rightInstruction.toString(16).toUpperCase();
		attributes.rightInstructionText = instructions[rightOpcode] !== undefined ? instructions[rightOpcode].name.replace('X', "0x" + attributes.rightAddrHex) : blankinstruction;

		attributes.number = word;
		attributes.rawHexNumber = attributes.number.toString(16).toUpperCase();

		return attributes[property];
	};

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
				// else if it is a jump instruction, then we take care of it at the specific instruction's code
				
			} else { // non existent opcode
				throw {
					name: "invalidInstruction",
					message: "Attempt to execute a non-existent instruction with opcode\n" +
						     reg.ir + " at address \n0x" + 
						     (reg.ctrl === "left_execute" ? reg.pc : reg.pc-1).toString(16).toUpperCase();
				}; // note: IAS handout says we should increment PC only in the right fetch cycle - hence the check above
			}

		},

		getRAM: function (addr, prop) {
			validateDataAccess(addr);
			var mem = ram[addr];
			if (fortybit_register_props[prop] === undefined) { // if prop is not a valid property for a 40 bit word
				throw {
					name: "invalidMemoryAttribute",
					message: "The specified attribute " + prop + " is not valid for a 40 bit word in RAM"
				};
			}
			prop = prop.toLowerCase();

			return getWordAttribute(mem, prop);
		},


		getCPU: function (register, prop) {
			register = register.toLowerCase();
			if (reg[register] === undefined) { // if there is no such register
				throw {
					name: "invalidRegister",
					message: "Specified register " + register + " is not part of the IAS architecture"
				};
			}
			if (register === "ctrl") {
				return reg.ctrl;
			}
			if (registers_to_prop[register][prop] === undefined) { // if prop is not a valid property for the selected register
				throw {
					name: "invalidCPURegisterAttribute",
					message: "The specified attribute " + prop + " is not valid for the register " + register
				};
			}
			prop = prop.toLowerCase();
			var word = reg[register];
			if (register === "ibr" || register === "pc" || register === "mar") { // IBR is duplicated (left and right instructions are one and the same). for the address registers, duplication works as well
				word = word + POW_OF_2[20]*word;
			} else if (register === "ir") { // shift and duplicate so left and right opcodes (which are the same) are available
				word *= POW_OF_2[12]; // shift
				word = word + POW_OF_2[20]*word;
			}

			return getWordAttribute(word, prop);
		},


		// TO DO. THIS FUNCTION IS ABSOLUTE GARBAGE
		setRAM: function (addr, prop, value) {
			validateDataAccess(addr);
			
			if (fortybit_register_props[prop] === undefined) { // if prop is not a valid property for a 40 bit word
				throw {
					name: "invalidMemoryAttribute",
					message: "The specified attribute " + prop + " is not valid for a 40 bit word in RAM"
				};
			}
			prop = prop.toLowerCase();

			if (prop.indexOf("text") !== -1) { // if this is one of the 'Text' properties
				throw {
					name: "memoryAttributeNotSupported",
					message: "The specified attribute " + prop + " is not currently supported for memory write operations"
				};
			}
			var num;
			if (prop.indexOf("hex") !== -1) { // if value is actually hex string
				var re = /^[\s]*(?:0x)?0*([0-9a-f]+)[\s]*$/i; // match a hexadecimal integer
				var m = re.exec(value);
				if (m === null) { // if no match
					throw {
						name: "invalidValueArgument",
						message: "expected a hexadecimal number as argument:\n" + value
					};
				}
				num = parseInt(m[1], 10); // convert our matched hex string
			} else { // just a regular number
				if (typeof value !== 'number') {
					throw {
						"invalidValueArgument",
						message: "expected a number as argument"
					};
				}
				if (num < 0) { // if num is negative, create the 2's compl representation
					num = POW_OF_2[40] + num;
				}
			}
			//validateNumRange(num, POW_OF_2[40]); // num must be in range [0, 2^40)
			
			

		},

		// TO DO
		dumpCPU: function () {


		},

		dumpRAM: function () {


		},

		// TO DO
		loadRAM: function (map) {
			

		}


	};

	

}) ();