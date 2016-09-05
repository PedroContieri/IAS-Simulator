// Copyright (c) 2016 Giuliano Sider

var ASSEMBLER = (function () {

	// utilities // some code (up to the end of the instructions array) was directly reused from the IAS module

	// return value's "bits" from lsb to lsb+numbits-1 (convention: lsb 0)
	// bits requested should be in range 0-39
	var selectBits = function (value, lsb, numbits) { 
		return Math.floor(value / POW_OF_2[lsb]) % POW_OF_2[numbits];
	};

	// left pads a string (str) with amt padchars
	var leftPadWithChar = function (str, padchars, amt) {
		var result = "";
		for (var i = 0; i < amt; i++) {
			result += padchars;
		}
		return result + str;
	}

	// make sure num is an integer in the appropriate range
	var validateNumRange = function (num, range) { // defensive debugging
		if (num < 0 || num >= range || num !== Math.floor(num)) {
			throw {
				name: "invalidNumber",
				message: "Attempt to use a number that's not an integer out of bounds:\n" +
				         num + "\nnot in range [0, " + range + ")"
			};
		}
	}

	var POW_OF_2 = []; // unfortunately we can't rely on bitwise ops (they convert to 32 bit integer)
	for (i = 0, p = 1; i <= 40; i++, p *= 2) {
		POW_OF_2[i] = p;
	}

	// format of instruction operand: address starting with 0x, or an identifier corresponding to a label or a previously declared variables (.set)
	// format of identifier: starts with $, _, a-z, A-Z. followed by any number of $, _, a-z, A-Z, 0-9
	// this is a numeric value that can be used in the address field: 
	// (0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)

	var blankinstruction = "(NO INSTRUCTION)    "; // 20 chars wide
	// all known IAS instructions
	var instructions = [];
	instructions[1] = {
		name: "LOAD M(X)",
		pattern: /^\s*LOAD\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[2] = {
		name: "LOAD -M(X)",
		pattern: /^\s*LOAD\s+-\s*M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[3] = {
		name: "LOAD |M(X)|",
		pattern: /^\s*LOAD\s+\|\s*M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*\|\s*$/i
			// capture group 1: address operand
	};
	instructions[5] = {
		name: "ADD M(X)",
		pattern: /^\s*ADD\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[6] = {
		name: "SUB M(X)",
		pattern: /^\s*SUB\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[7] = {
		name: "ADD |M(X)|",
		pattern: /^\s*ADD\s+\|\s*M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*\|\s*$/i
			// capture group 1: address operand
	};
	instructions[8] = {
		name: "SUB |M(X)|",
		pattern: /^\s*SUB\s+\|\s*M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*\|\s*$/i
			// capture group 1: address operand
	};
	instructions[9] = {
		name: "LOAD MQ,M(X)",
		pattern: /^\s*LOAD\s+MQ\s*,\s*M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[10] = {
		name: "LOAD MQ",
		pattern: /^\s*LOAD\s+MQ\s*$/i
	};
	instructions[11] = {
		name: "MUL M(X)",
		pattern: /^\s*MUL\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[12] = {
		name: "DIV M(X)",
		pattern: /^\s*DIV\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[13] = {
		name: "JUMP M(X,0:19)", // bit convention: MSB 0
		pattern: /^\s*JUMP\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*(,\s*0\s*:\s*19)?\s*\)\s*$/i
			// capture group 1: address operand. capture group 2: does it refer to left halfword explicitly?
	};
	instructions[14] = {
		name: "JUMP M(X,20:39)", // bit convention: MSB 0
		pattern: /^\s*JUMP\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*,\s*20\s*:\s*39\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[15] = {
		name: "JUMP+ M(X,0:19)", // bit convention: MSB 0
		pattern: /^\s*JUMP\+\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*(,\s*0\s*:\s*19)?\s*\)\s*$/i
			// capture group 1: address operand. capture group 2: does it refer to left halfword explicitly?
	};
	instructions[16] = {
		name: "JUMP+ M(X,20:39)", // bit convention: MSB 0
		pattern: /^\s*JUMP\+\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*,\s*20\s*:\s*39\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[18] = {
		name: "STOR M(X,8:19)", // bit convention: MSB 0
		pattern: /^\s*STOR\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*,\s*(8\s*:\s*19)?\s*\)\s*$/i
			// capture group 1: address operand. capture group 2: does it refer to left halfword explicitly?
	};
	instructions[19] = {
		name: "STOR M(X,28:39)", // bit convention: MSB 0
		pattern: /^\s*STOR\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*,\s*28\s*:\s*39\s*\)\s*$/i
			// capture group 1: address operand
	};
	instructions[20] = {
		name: "LSH",
		pattern: /^\s*LSH\s*$/i
	};
	instructions[21] = {
		name: "RSH",
		pattern: /^\s*RSH\s*$/i
	};
	instructions[33] = {
		name: "STOR M(X)",
		pattern: /^\s*STOR\s+M\s*\(\s*(0x[0-9a-f]+|[_a-z$][_a-z$0-9]*)\s*\)\s*$/i
			// capture group 1: address operand
	};

	// input source lines must be one of the types below:
	// (hash marks are used to comment code)
	var ORG=0, WORD=1, WFILL=2, SET=3, ALIGN=4, LABELORINSTRUCTION=5;
	var linePatterns = [];
	// values denoted by VALUE can be a. variables, b. labels, 
	// c. hex numbers starting with 0x or having a-f, 
	// d. hex numbers with spaces between digits (ex: 01 02 01 00 45),
	// e. other numbers (decimal).
	// values denoted by N cannot be labels (otherwise we can have a circular dependency).
	linePatterns[ORG] = {
		name: ".org N", // sets the location counter at N.
		pattern: /^\s*\.org\s+([_a-z$][_a-z$0-9]*|-?\s*(?:0x)?[a-f0-9\s]+)\s*(?:#.*)?$/i
			// capture group 1: N
	};
	linePatterns[WORD] = {
		name: ".word VALUE", // assembles a numerical 40 bit value at the current location counter
		pattern: /^\s*\.word\s+([_a-z$][_a-z$0-9]*|-?\s*(?:0x)?[a-f0-9\s]+)\s*(?:#.*)?$/i
			// capture group 1: VALUE
	};
	linePatterns[WFILL] = {
		name: ".wfill N,VALUE", // assembles N words with VALUE at the current assembly point
		pattern: /^\s*\.wfill\s+([_a-z$][_a-z$0-9]*|-?\s*(?:0x)?[a-f0-9\s]+)\s*,\s*([_a-z$][_a-z$0-9]*|-?\s*(?:0x)?[a-f0-9\s]+)\s*(?:#.*)?$/i
			// capture group 1: N. capture group 2: VALUE
	};
	linePatterns[SET] = {
		name: ".set NAME,N", // gives the symbol NAME some value N (NAME must not be one of the labels, which are constant)
		pattern: /^\s*\.set\s+([a-z_$][a-z0-9_$]*)\s*,\s*([_a-z$][_a-z$0-9]*|-?\s*(?:0x)?[a-f0-9\s]+)\s*(?:#.*)?$/i
			// capture group 1: NAME. group 2: VALUE
	};
	linePatterns[ALIGN] = {
		name: ".align N", // advances the location counter to the next (bigger than or equal) multiple of N. note that .align 1 makes sense since we could be right in the middle of a word
		pattern: /^\s*\.align\s+([_a-z$][_a-z$0-9]*|-?\s*(?:0x)?[a-f0-9\s]+)\s*(?:#.*)?$/i
		// capture group 1: N
	};
	linePatterns[LABELORINSTRUCTION] = {
		name: "[LABEL:][INSTRUCTION]", // assigns, if present, the symbol represented by LABEL the current value of the location counter; then, if present, assembles the instruction
		pattern: /^\s*(?:([a-z_$][a-z0-9_$]*)\s*:)?\s*([^#]*)?\s*(?:#.*)?$/i
			// capture group 1: optional label identifier. group 2: optional instruction (still to be parsed)
	};
	// we could have 'tokenized' the input source code and then processed it, etc,
	// but matching input lines to the above patterns seems to be a simpler solution to a simple parsing problem
	// is there a more elegant way to format regexps in javascript?
	

	var obtainNumber = (function () { // converts a string representing an IAS assembler number (not an identifier) to a javascript number in 2's complement form
		// this is a numeric value that can be used in an IAS directive:
		// ([_a-z$][_a-z$0-9]*|-?\s*(?:0x)?[a-f0-9\s]+)
		var hashexdigits = /0x|[a-f]/i; // if a number has 0x or a letter, it must be hex.
		var spaces = /\s/g; // if the number has a space inside of it, we trim the spaces and interpret it as hex (ex: "00 01 10 29 30")
		var spacesinmiddleofnumber = /[a-f0-9]\s+[a-f0-9]/i;
		return function(numString) {
			var num;
			if (spacesinmiddleofnumber.test(numString) || hashexdigits.test(numString)) { // then it must be hex
				num = parseInt(numString.replace(spaces, ""), 16); // remove spaces first
			}
			else { // the argument is a decimal number
				num = parseInt(numString.replace(spaces, ""), 10); // explicitly avoids parsing the number as octal
			}
			if (num < 0) { // then 2's complement it
				num = POW_OF_2[40] - num;
			}
			return num;
		};
	}) ();

	// var RAM_SIZE = 1024; // the assembler doesn't care. gets string, expels string.

	// takes the source code as input, spits out a valid IAS memory map as output, or fires an exception if the source code has a syntax error
	// we could return some object with a 'name' and a 'message' property instead of firing an exception, but that would be the same thing (except that the exception doesn't fail silently, unless you neuter it with try/catch)
	// memory map examples: 000 01 100 05 101\n001 05 101 05 101\n ... 
	var assemble = function (src) { // MUST REFACTOR. TOO BIG FOR A PROBLEMATIC LANGUAGE LIKE JAVASCRIPT
		// addrlength is the (string) length of the address field in the memory map. note that IAS memory addresses are 3 nibbles in size
		var ADDRLENGTH = 3; // line address: fixed length of 3 characters by default
		var WORDLENGTH = 10; // 10 nibbles to a word in IAS
		var INSTRUCTIONLENGTH = 5;
		var mem = []; // array of nibbles composing memory. TEN PER WORD. [0-9A-F]
		var ias = {locationCounter: 0}; // start assembling at 0x0
		var labels = {}; // labels are constant integer addresses (defined only once)
		var variables = {}; // used with the .set directive. can be redefined. cannot be a label.
		var plugInAddresses = {}; // saves the memory position of address operands of instructions that still need to be filled later. note that all memory operands are 3 nibbles long
		var identifierPattern = /^[_a-z$][_a-z$0-9]*$/i;

		var insertInMem = function (nibbleindex, howmanynibbles, value) {
			// insert a (2's complement) number in the specified field of mem
			// note that if value is too big, the least significant nibbles are inserted (although still in big endian order)
			while (howmanynibbles) { // while there are nibbles to insert in the memory map
				howmanynibbles--;
				mem[nibbleindex + howmanynibbles] = (value % 16).toString(16);
				value = Math.floor(value / 16);
			}
		};

		var linesOfCode = src.split("\n");
		for (var i = 0; i < linesOfCode.length; i++) { // for each line in the source stream, do:

			var lineMatch = null, j; // line match, and index j of the line pattern matched
			for (j = 0; j < linePatterns.length; j++) { // which type of source line is it?
				lineMatch = linePatterns[j].pattern.exec(linesOfCode[i]);
				if (lineMatch !== null) { // if we found a match
					break;
				}
			}
			if (lineMatch === null) { // if there was no match for this source line
				throw {
					name: "assemblerSyntaxError",
					message: "Line " + (i+1) + ", reading:\n" +
					         linesOfCode[i] + "\n" + "is not a valid IAS assembler directive or instruction"
				};
			}

			// helper functions and memory assemble functions
			var validateNumberToken = function (number) {
				if (number >= POW_OF_2[40]) {
					throw {
						name: "invalidIASnumber",
						message: "an out of bounds IAS number,\n" + number +
						         "\nwas entered at line " + (i+1)
					};
				}
			};
			// N can be a variable or number
			var obtainAssemblerOperand_N = function(N) {
				if (identifierPattern.test(N)) { // if it's an identifier
					if (variables[N]) { // if the variable is defined
						N = variables[N];
					}
					else {
						throw {
							name: "undefinedVariable",
							message: "an undefined variable,\n" + N +
							         "\nwas used at line " + (i+1)
						};
					}
				}
				else { // it's a number
					N = obtainNumber(N);
				}
				validateNumberToken(N); // within bounds?
				return N;
			};
			// value can be a variable, label or number
			var obtainAssemblerOperand_VALUE = function(value) {
				if (identifierPattern.test(value)) { // if it's an identifier
					if (variables[value]) { // if the variable is defined
						value = variables[value];
					}
					else if (labels[value]) { // if the label is defined
						value = Math.floor(labels[value]/WORDLENGTH);
					}
					else { // must be a label that's not defined yet
						plugInAddresses[ias.locationCounter] = {
							name: value, // value of the label will be inserted later at this address
							length: WORDLENGTH
						};
						value = 0; // value will be replaced later
					}
				}
				else { // it's a number
					value = obtainNumber(value);
				}
				validateNumberToken(value);
				return value;
			};


			var num, value, N, name; // represents operands below (javascript has no block scope..)
			switch (j) { // which pattern did this source line match
			case ORG: // .org N
				N = obtainAssemblerOperand_N(lineMatch[1]);

				if (ias.locationCounter % WORDLENGTH !== 0 && mem[ias.locationCounter] === undefined) {
					// if we are not word aligned and the second part of the word is empty, we need to make sure there is stuff there
					insertInMem(ias.locationCounter, WORDLENGTH/2, 0); // fill with zero
				}
				ias.locationCounter = WORDLENGTH * N;
				break;
			case WORD: // .word VALUE
				value = obtainAssemblerOperand_VALUE(lineMatch[1]);
				
				insertInMem(ias.locationCounter, WORDLENGTH, value);
				ias.locationCounter += WORDLENGTH;
				break;
			case WFILL: // .wfill N, VALUE
				N = obtainAssemblerOperand_N(lineMatch[1]);
				value = obtainAssemblerOperand_VALUE(lineMatch[2]);

				for (var _i = 0; _i < N; _i++) {
					insertInMem(ias.locationCounter, WORDLENGTH, value);
					ias.locationCounter += WORDLENGTH;
				}

				break;
			case SET: // .set NAME, N
				name = lineMatch[1];
				if (labels[name]) { // if there is a label with this name
					throw {
						name: "invalidVariableName",
						message: "name of variable\n" + name + 
						         "\nused in line " + (i+1) + " is also a label name"
					};
				}
				N = obtainAssemblerOperand_N(lineMatch[2]);
			
				variables[name] = N; // assign the value to the variable
				break;
			case ALIGN: // .align N
				N = obtainAssemblerOperand_N(lineMatch[1]);
				
				while (ias.locationCounter % (WORDLENGTH*N) !== 0) { // while we are not aligned
					mem[ias.locationCounter] = "0";
					ias.locationCounter++;
				}

				break;
			case LABELORINSTRUCTION: // [LABEL][INSTRUCTION]
				var labelname = lineMatch[1];
				if (labelname) { // if there is a label name to process
					if (variables[labelname]) { // if there is a variable with this name
						throw {
							name: "invalidLabelName",
							message: "name of label\n" + labelname + 
							         "\nused in line " + (i+1) + " is also a variable name"
						};
					}
					if (labels[labelname]) { // if there is already a label with this name
						throw {
							name: "invalidLabelName",
							message: "name of label\n" + labelname + 
							         "\nused in line " + (i+1) + " has already been defined"
						};
					}
					labels[labelname] = ias.locationCounter; // must later be converted to an actual address
				}
				var instructionStr = lineMatch[2];
				if (instructionStr) { // if there is an instruction to process
					var matchedInstruction = null, k; // instruction match and its index
					for (k in instructions) {
						if (instructions.hasOwnProperty(k)) { // for each instruction, see if we have a match
							matchedInstruction = instructions[k].pattern.exec(instructionStr);
							if (matchedInstruction !== null) {
								break;
							}
						}
					}
					k = parseInt(k);
					if (matchedInstruction === null) { // if it doesn't match any instruction
						throw {
							name: "instructionSyntaxError",
							message: "the instruction\n" + instructionStr + 
							         "\nat line " + (i+1) + " has invalid syntax"
						};
					}
					insertInMem(ias.locationCounter, 2, k); // insert instruction opcode in mem map
					ias.locationCounter += 2;
					var addrfield = matchedInstruction[1];
					var specifiedLeftOrRightVariant = matchedInstruction[2]; // for jumps and address field stores only
					if (addrfield) { // if the instruction has an address field
						if (identifierPattern.test(addrfield)) { // if it's an identifier
							if (variables[addrfield]) { // if the variable is defined
								addrfield = variables[addrfield];
							}
							else if (labels[addrfield]) { // if the label is defined
								if (labels[addrfield] % WORDLENGTH !== 0 && !specifiedLeftOrRightVariant && (k === 13 || k === 15 || k === 18)) {
									// if the label is to the right, but we have an instruction that could refer to either left or right (jump, jump+, address field store), then correct it (it initially defaults to left)
									insertInMem(ias.locationCounter-2, 2, k+1); // correct the opcode field: jump m(addr, 0:19) becomes jump m(addr, 20:39) for example
								}
								addrfield = Math.floor(labels[addrfield]/WORDLENGTH);
							}
							else { // must be a label that's not defined yet
								plugInAddresses[ias.locationCounter] = {
									name: addrfield, // value of the label will be inserted later at this address
									length: ADDRLENGTH
								};
								if (!specifiedLeftOrRightVariant && (k === 13 || k === 15 || k === 18)) {
									// if we have an instruction that could refer to either left or right (jump, jump+, address field store), then we might have to correct it later (it initially defaults to left)
									plugInAddresses[ias.locationCounter].checkLeftOrRightInInstruction = true; // we might have to correct the opcode field, depending on the label address. jump m(addr, 0:19) would become jump m(addr, 20:39) for example
								}
								addrfield = 0; // the instruction will be stitched up at the end
							}
						}
						else { // it must be a hexadecimal address
							addrfield = parseInt(addrfield, 16);
						}
					}
					else { // the instruction has no address field. just insert 0
						addrfield = 0;
					}
					insertInMem(ias.locationCounter, ADDRLENGTH, addrfield);
					ias.locationCounter += ADDRLENGTH;
				}
				break;
			} // switch (line type)

		} // for each (line of source code)

		if (ias.locationCounter % WORDLENGTH !== 0 && mem[ias.locationCounter] === undefined) {
			// if we are not word aligned and the second part of the word is empty, we need to make sure there is stuff there
			insertInMem(ias.locationCounter, WORDLENGTH/2, 0); // fill with zero
		}

		// plug in missing addresses from instructions and data
		for (var addr in plugInAddresses) {
			if (plugInAddresses.hasOwnProperty(addr)) { // for each missing sequence of values
				addr = parseInt(addr);
				var plugInObject = plugInAddresses[addr];
				value = labels[plugInObject.name];
				if (value === undefined) { // if the label was never defined
					throw {
						name: "undefinedLabel",
						message: "the label " + plugInObject.name + " was used but never defined"
					};
				}
				if (plugInObject.checkLeftOrRightInInstruction) { // if we might have to correct the opcode of jump
					var previousInstructionOpcode = parseInt(mem[addr-2]+mem[addr-1], 16);
					if (value % WORDLENGTH !== 0) { // then we have to correct the instruction to make it jump to the right (it was left by default)
						insertInMem(addr-2, 2, previousInstructionOpcode+1); // for example, jump m(addr, 0:19) becomes jump m(addr, 20:39)
					}
				}
				var length = plugInObject.length;
				if (length <= WORDLENGTH) {
					insertInMem(addr, length, Math.floor(value/WORDLENGTH)); // insert value of forward-referenced label
					addr += length;
				}
				else { // has to be a .wfill
					while (length > 0) {
						insertInMem(addr, WORDLENGTH, Math.floor(value/WORDLENGTH)); // insert value of forward-referenced label
						addr += WORDLENGTH;
						length -= WORDLENGTH;
					}
				}
				if (addr % WORDLENGTH !== 0 && mem[addr] === undefined) {
					// if we are not word aligned and the second part of the word is empty, we need to make sure there is stuff there
					insertInMem(addr, WORDLENGTH/2, 0); // fill with zero
				}				

			}
		}

		// produce a memory map from the memory words that we've filled in
		var memMap = "";
		for (i in mem) {
			if (mem.hasOwnProperty(i) && i % WORDLENGTH == 0) { // for each word we filled in
				// remember, our memory map may be sparse
				i = parseInt(i, 10); // it considered the index a string for concatenation down below. javascript never ceases to amaze me
				addr = (i/WORDLENGTH).toString(16);
				var line = leftPadWithChar(addr, "0", (ADDRLENGTH - addr.length)); // left pad the address field with zeroes
				line += "\t\t";

				line += mem[i] + mem[i+1] + " " + mem[i+2] + mem[i+3] + mem[i+4] + "\t";
				line += mem[i+5] + mem[i+6] + " " + mem[i+7] + mem[i+8] + mem[i+9] + "\n";

				memMap += line.toUpperCase();
			}
		}
		return memMap;
	};

	// converts a memory map into disassembled form
	// if fillwithzeroes (optional arg) is true, it fills the gaps of the memory map with zeroes
	var disassemble = function (map, fillwithzeroes) {

		// set of memory words that are explicitly set in the memory map,
		// with addr attribute (key), left opcode, left addr, right opcode, right addr
		var mem = []; // set of values that are explicitly set in the memory map

		var lines = map.split("\n"); // process each line corresponding to a word in memory
		
		// represents a line with data/instructions: a hex address followed by hex numbers. 
		// whitespace only mandatory for separating the address and the memory value. comments optional.
		var linepattern = /^\s*(?:([0-9a-f]+)\s+([0-9a-f][0-9a-f\s]*))?\s*(?:#.*)?$/i; 
		
		var whitespace = /\s/g; // represents a single whitespace
		var whitespaceonly = /^\s*$/; // represents a whitespace only string (possibly empty)
		for (var i = 0; i < lines.length; i++) {
			var m = lines[i].match(linepattern); // capture 1: line addr. capture 2: number (with possible whitespace interspersed)
			if (m === null) { // if the line does match our pattern
				throw {
					name: "invalidMap",
					message: "Line " + (i+1) + " of the memory map is not in the valid format:\n" +
					         "<address> <number> [#comment]" + "\n" +
					         ", where <number> may have any amount of whitespaces, and comments are optional"
				};
			}
			if (!m[1]) { // if we didn't capture a numerical memory map entry
				continue; // there is nothing to be parsed on this line
			}
			var word = {}; // info about data to be disassembled, indexed by address
			word.addr = parseInt(m[1], 16); // capture group 1 is the memory address
			
			word.value = parseInt(m[2].replace(whitespace, ""), 16); // capture 2: memory value. eliminate whitespace
			validateNumRange(word.value, POW_OF_2[40]);
			
			var leftopcode = selectBits(word.value, 32, 8);
			var rightopcode = selectBits(word.value, 12, 8);
			var leftaddr = selectBits(word.value, 20, 12).toString(16).toUpperCase();
			var rightaddr = selectBits(word.value, 0, 12).toString(16).toUpperCase();
			if (instructions[leftopcode] === undefined) {
				word.leftinstructiontext = blankinstruction;
				if (instructions[rightopcode] === undefined) {
					word.rightinstructiontext = blankinstruction;
					word.type = "pure data";
				} else { // we do have an instruction on the right
					word.rightinstructiontext = instructions[rightopcode].name.replace("X", "0x" + rightaddr);
					word.type = "only instruction on the right"; // literate programming!
				}
			}
			else { // we do have an instruction on the left
				word.leftinstructiontext = instructions[leftopcode].name.replace("X", "0x" + leftaddr);
				if (instructions[rightopcode] === undefined) {
					word.rightinstructiontext = blankinstruction;
					word.type = "only instruction on the left";
				} else { // we do have an instruction on the right
					word.rightinstructiontext = instructions[rightopcode].name.replace("X", "0x" + rightaddr);
					word.type = "pure instruction";
				}
			}
			mem.push(word);
		}

		mem.sort(function (word1, word2) {
			if (word1.addr < word2.addr) return -1;
			else if (word1.addr > word2.addr) return 1;
			else return 0; // equality
		});

		var disassembly = "";

		//var mode = "instruction"; // or "data"
		var lastdata, lastdataaddr = -1;
		//var lastassembly, lastassemblyaddr = -1
		var datavaluerepeatcount = 0; // previous one was an instruction
		for (var i = 0; i < mem.length; i++) { // for each line in the memory map, in order of increasing addresses:
			var line = "";

			var reachedaninstruction = function () { // LP in IAS: the great american novel
				return mem[i].type !== "pure data" ? true : false
			};
			var crossedagap = function () {
				return mem[i].addr - lastdataaddr > 1 ? true : false;
			};
			var differentvaluereached = function () {
				return mem[i].value !== lastdata ? true : false;
			}

			if (datavaluerepeatcount > 1 && (reachedaninstruction() || crossedagap() || differentvaluereached())) {
				line += ".wfill " + datavaluerepeatcount + ", " + lastdata + "\n";
			} // fill a sequence of equal, consecutive values in memory

			if (datavaluerepeatcount === 1 && (reachedaninstruction() || crossedagap() || differentvaluereached())) {
				line += ".word " + lastdata + "\n";
			} // insert a singleton data value into memory

			if (crossedagap()) {
				if (fillwithzeroes) {
					line += ".wfill " + (mem[i].addr - lastdataaddr) + ", 0 " + "# gap in memory map\n";
				} else { // just skip and leave the gap undefined
					line += ".org " + "0x" + mem[i].addr.toString(16).toUpperCase() + " # gap from " + lastdataaddr.toString(16).toUpperCase() + " to " + mem[i].addr.toString(16).toUpperCase() + "\n";
				}
			}

			if (datavaluerepeatcount > 0 && mem[i].value === lastdata && !crossedagap()) {
				// if this is some consecutive sequence of equal values
				datavaluerepeatcount++;
			} else {
				if (mem[i].type === "pure instruction") {
					datavaluerepeatcount = 0;
					line += mem[i].leftinstructiontext + "\n" + mem[i].rightinstructiontext + "\n";
				} else if (mem[i].type === "only instruction on the left") {
					datavaluerepeatcount = 0;
					line += ".word " + "0x" + mem[i].value.toString(16).toUpperCase() + " # " + mem[i].leftinstructiontext + " ; " + "0x" + selectBits(mem[i].value, 12, 8).toString(16) + " " + "0x" + selectBits(mem[i].value, 0, 12).toString(16).toUpperCase() + "\n"
				} else if (mem[i].type === "only instruction on the right") {
					datavaluerepeatcount = 0;
					line += ".word " + "0x" + mem[i].value.toString(16).toUpperCase() + " # " + "0x" + selectBits(mem[i].value, 32, 8).toString(16).toUpperCase() + " " + "0x" + selectBits(mem[i].value, 20, 12).toString(16).toUpperCase() + " ; " + mem[i].rightinstructiontext + "\n"
				} else if (mem[i].type === "pure data") {
					datavaluerepeatcount = 1;
				}
			}

			lastdata = mem[i].value;
			lastdataaddr = mem[i].addr;

			if (line) {
				disassembly += line;
			}
		}
		// is there a .data or .wfill to finish up here?
		if (datavaluerepeatcount === 1) { // must insert a .word
			disassembly += ".word " + lastdata + "\n";
		} else if (datavaluerepeatcount > 1) { // must insert a .wfill
			disassembly += ".wfill " + datavaluerepeatcount + ", " + lastdata + "\n";
		}

		return disassembly;
	};

	return { // return the public methods
		assemble: assemble, disassemble: disassemble
	};

}) (); // initialize the assembler machine and return the public methods