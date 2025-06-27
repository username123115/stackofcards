import * as Blockly from 'blockly/core';
import * as Defs from '../customBlocks/defs';

import type { GameConfig } from '@client/types/engine/config';

import type { NumberExpression, BooleanExpression, PlayerExpression, PlayerCollectionExpression, ZoneExpression, ZoneCollectionExpression, CardCollectionExpression, RankExpression, SuitExpression, CardExpression, CardSetExpression } from '@client/types/engine/expressions';

import type { Statement, ConditionalStatement, Offer, ChoiceSelection, ChoiceAction } from '@client/types/engine/statements'

/**
 * Converts a game configuration JSON object into Blockly blocks on the given workspace.
 * @param jsonConfig The game configuration phases object.
 * @param workspace The Blockly workspace to populate.
 */
export function gameConfigToWorkspace(jsonConfig: GameConfig['phases'], workspace: Blockly.WorkspaceSvg): void {
	let yPos = 10;

	Object.entries(jsonConfig).map(
		([phaseName, phaseData]) => {

			if (phaseData) {
				const phaseBlock = workspace.newBlock(Defs.B_PHASE);
				phaseBlock.setFieldValue(phaseName, 'PHASE');
				phaseBlock.initSvg();
				phaseBlock.render();
				phaseBlock.moveBy(10, yPos);

				if (phaseData.evaluate) {
					jsonToStatementBlock(phaseData.evaluate, workspace, phaseBlock.nextConnection);
				}

				yPos += phaseBlock.getHeightWidth().height + 50;
			}
		}
	)
}

function jsonToStatementBlock(
	jsonStatement: Statement | "Empty" | { Block: Statement[] },
	workspace: Blockly.WorkspaceSvg,
	previousBlockConnection: Blockly.Connection | null
): Blockly.Block | null {
	let currentBlock: Blockly.BlockSvg | null = null;

	if (typeof jsonStatement === 'string' && jsonStatement === 'Empty') {
		return null;
	} else if (typeof jsonStatement === 'object' && 'Block' in jsonStatement) {
		const statements = jsonStatement.Block;
		let lastStatementBlockInSequence: Blockly.Block | null = null;
		let nextConnectionForSequence = previousBlockConnection;

		for (const stmt of statements) {
			const newBlockInSequence = jsonToStatementBlock(stmt, workspace, nextConnectionForSequence);
			if (newBlockInSequence) {
				lastStatementBlockInSequence = newBlockInSequence;
				nextConnectionForSequence = newBlockInSequence.nextConnection;
			} else {
				nextConnectionForSequence = null;
			}
		}
		return lastStatementBlockInSequence; // The "Block" itself isn't a block, returns the last actual block
	} else if (typeof jsonStatement === 'object' && jsonStatement !== null) {
		// Handle single statement objects
		const statementType = Object.keys(jsonStatement)[0] as keyof Statement;
		const statementValue = (jsonStatement as any)[statementType]; // Value of the statement

		switch (statementType) {
			case 'SetNumber': {
				currentBlock = workspace.newBlock(Defs.B_SET_NUMBER);
				currentBlock.setFieldValue(statementValue.name, 'NAME');
				const valueInput = jsonToExpressionBlock(statementValue.value, workspace);
				if (valueInput && currentBlock.getInput('VALUE')?.connection) {
					currentBlock.getInput('VALUE')!.connection!.connect(valueInput.outputConnection!);
				}
				break;
			}
			case 'EnterPhase': {
				currentBlock = workspace.newBlock(Defs.B_ENTER_PHASE);
				currentBlock.setFieldValue(statementValue as string, 'PHASE_NAME');
				break;
			}
			case 'GenerateCards': {
				currentBlock = workspace.newBlock(Defs.B_GEN_CARDS);
				//TODO: More gets later
				if (statementValue.cards && typeof statementValue.cards === 'object' && 'AllAllowed' in statementValue.cards) {
					currentBlock.setFieldValue('ALL', 'CARDS'); // 'ALL' is the value for "all allowed" in defs.ts
				} else {
					console.warn('Unhandled CardSetExpression for GenerateCards:', statementValue.cards);
				}
				const destInput = jsonToExpressionBlock({ Zone: statementValue.dest }, workspace);
				if (destInput && currentBlock.getInput('DEST')?.connection) {
					currentBlock.getInput('DEST')!.connection!.connect(destInput.outputConnection!);
				}
				break;
			}
			case 'Shuffle': {
				currentBlock = workspace.newBlock(Defs.B_SHUFFLE);
				const zonesInput = jsonToExpressionBlock({ ZoneCollection: statementValue }, workspace);
				if (zonesInput && currentBlock.getInput('ZONES')?.connection) {
					currentBlock.getInput('ZONES')!.connection!.connect(zonesInput.outputConnection!);
				}
				break;
			}
			case 'Deal': {
				currentBlock = workspace.newBlock(Defs.B_DEAL_CARD);
				const numCardsInput = jsonToExpressionBlock({ Number: statementValue.num_cards }, workspace);
				const sourceInput = jsonToExpressionBlock({ Zone: statementValue.source }, workspace);
				const destInput = jsonToExpressionBlock({ ZoneCollection: statementValue.dest }, workspace);

				if (numCardsInput && currentBlock.getInput('NUM_CARDS')?.connection) {
					currentBlock.getInput('NUM_CARDS')!.connection!.connect(numCardsInput.outputConnection!);
				}
				if (sourceInput && currentBlock.getInput('SOURCE')?.connection) {
					currentBlock.getInput('SOURCE')!.connection!.connect(sourceInput.outputConnection!);
				}
				if (destInput && currentBlock.getInput('DEST')?.connection) {
					currentBlock.getInput('DEST')!.connection!.connect(destInput.outputConnection!);
				}
				break;
			}
			case 'MoveCardsTo': {
				currentBlock = workspace.newBlock(Defs.B_CARDS_MOVE);
				const sourceInput = jsonToExpressionBlock({ CardCollection: statementValue.source }, workspace);
				const destInput = jsonToExpressionBlock({ Zone: statementValue.dest }, workspace);
				if (sourceInput && currentBlock.getInput('SOURCE')?.connection) {
					currentBlock.getInput('SOURCE')!.connection!.connect(sourceInput.outputConnection!);
				}
				if (destInput && currentBlock.getInput('DEST')?.connection) {
					currentBlock.getInput('DEST')!.connection!.connect(destInput.outputConnection!);
				}
				break;
			}
			case 'Conditional': {
				currentBlock = workspace.newBlock(Defs.B_IF_ELSE);
				const typedValue = statementValue as ConditionalStatement;
				const conditionInput = jsonToExpressionBlock({ Boolean: typedValue.condition }, workspace);
				if (conditionInput && currentBlock.getInput('CONDITION')?.connection) {
					currentBlock.getInput('CONDITION')!.connection!.connect(conditionInput.outputConnection!);
				}

				const goTrueInput = currentBlock.getInput('GO_TRUE');
				if (goTrueInput?.connection) {
					const trueBranchBlock = jsonToStatementBlock(typedValue.go_true, workspace, null); // Connect to input, not sequentially
					if (trueBranchBlock?.previousConnection) {
						goTrueInput.connection.connect(trueBranchBlock.previousConnection);
					}
				}

				const goFalseInput = currentBlock.getInput('GO_FALSE');
				if (goFalseInput?.connection) {
					const falseBranchBlock = jsonToStatementBlock(typedValue.go_false, workspace, null);
					if (falseBranchBlock?.previousConnection) {
						goFalseInput.connection.connect(falseBranchBlock.previousConnection);
					}
				}
				break;
			}
			case 'DeclareWinner': {
				currentBlock = workspace.newBlock(Defs.B_DECLARE_WINNER);
				const playerInput = jsonToExpressionBlock({ PlayerCollection: statementValue }, workspace); // statementValue is PlayerCollectionExpression
				if (playerInput && currentBlock.getInput('PLAYER')?.connection) {
					currentBlock.getInput('PLAYER')!.connection!.connect(playerInput.outputConnection!);
				}
				break;
			}
			case 'AdvancePlayerState': { // This is AdvancePlayerState(NumberExpression)
				currentBlock = workspace.newBlock(Defs.B_PLAYER_ADVANCE);
				// statementValue is NumberExpression directly for this variant
				const advanceInput = jsonToExpressionBlock({ Number: statementValue }, workspace);
				if (advanceInput && currentBlock.getInput('ADVANCE')?.connection) {
					currentBlock.getInput('ADVANCE')!.connection!.connect(advanceInput.outputConnection!);
				}
				break;
			}
			// Note: AdvancePlayerStateByType is another variant in statements.rs, not yet in customBlocks/defs.ts explicitly by that name
			// It would map to B_PLAYER_ADVANCE_TYPE if that's the intention.
			case 'While': {
				currentBlock = workspace.newBlock(Defs.B_WHILE);
				const conditionInput = jsonToExpressionBlock({ Boolean: statementValue.condition }, workspace);
				if (conditionInput && currentBlock.getInput('CONDITION')?.connection) {
					currentBlock.getInput('CONDITION')!.connection!.connect(conditionInput.outputConnection!);
				}
				const doInput = currentBlock.getInput('DO');
				if (doInput?.connection) {
					const doBranchBlock = jsonToStatementBlock(statementValue.do, workspace, null);
					if (doBranchBlock?.previousConnection) {
						doInput.connection.connect(doBranchBlock.previousConnection);
					}
				}
				break;
			}
			case 'Offer': {
				const offerData = statementValue as Offer;
				if (offerData.player_name && offerData.player_name !== null) {
					currentBlock = workspace.newBlock(Defs.B_OFFER);
					currentBlock.setFieldValue(offerData.player_name, 'PLAYER_NAME');
				} else {
					currentBlock = workspace.newBlock(Defs.B_OFFER_DECLARELESS);
				}

				const offerToInput = jsonToExpressionBlock({ PlayerCollection: offerData.offer_to }, workspace);
				if (offerToInput && currentBlock.getInput('OFFER_TO')?.connection) {
					currentBlock.getInput('OFFER_TO')!.connection!.connect(offerToInput.outputConnection!);
				}

				let previousCaseConnection: Blockly.Connection | null = currentBlock.getInput('CASES')!.connection!;
				for (const offerCase of offerData.cases) {
					const caseBlock = workspace.newBlock(offerCase.condition ? Defs.B_OFFER_CASE : Defs.B_OFFER_CASE_ANY);
					caseBlock.initSvg(); // Init early for connections

					if (offerCase.condition) {
						const filterInput = jsonToExpressionBlock({ Boolean: offerCase.condition }, workspace);
						if (filterInput && caseBlock.getInput('FILTER')?.connection) {
							caseBlock.getInput('FILTER')!.connection!.connect(filterInput.outputConnection!);
						}
					}
					caseBlock.setFieldValue(offerCase.message, 'PROMPT');

					let previousChoiceConnection: Blockly.Connection | null = caseBlock.getInput('OFFERS')!.connection!;
					for (const choice of offerCase.choices) {
						let choiceBlock: Blockly.BlockSvg | null = null;
						if ('Selection' in choice) {
							const selectionData = choice.Selection as ChoiceSelection;
							choiceBlock = workspace.newBlock(Defs.V_CHOICE_UNIFIED);
							choiceBlock.setFieldValue(selectionData.name, 'AS');

							const selectionEnum = selectionData.choice_type;
							let choiceTypeString = '';
							let sourceExpression: any = null;

							if ('Player' in selectionEnum) { // Player means PlayerCollectionExpression
								choiceTypeString = 'socs_t_player'; // Dropdown value
								sourceExpression = { PlayerCollection: selectionEnum.Player };
							} else if ('PlayerSelection' in selectionEnum) {
								choiceTypeString = 'socs_t_player_sel';
								sourceExpression = { PlayerCollection: selectionEnum.PlayerSelection };
							} else if ('Card' in selectionEnum) { // Card means CardCollectionExpression
								choiceTypeString = 'socs_t_card';
								sourceExpression = { CardCollection: selectionEnum.Card };
							} else if ('CardSelection' in selectionEnum) {
								choiceTypeString = 'socs_t_card_sel';
								sourceExpression = { CardCollection: selectionEnum.CardSelection };
							}
							choiceBlock.setFieldValue(choiceTypeString, Defs.F_DROPDOWN_TYPE); // CHOICE_TYPE field name from defs
							const sourceBlock = jsonToExpressionBlock(sourceExpression, workspace);
							if (sourceBlock && choiceBlock.getInput(Defs.F_SOURCE)?.connection) { // SOURCE field name from defs
								choiceBlock.getInput(Defs.F_SOURCE)!.connection!.connect(sourceBlock.outputConnection!);
							}

						} else if ('Action' in choice) { // ChoiceAction
							const actionData = choice.Action as ChoiceAction;
							if ('MoveCards' in actionData) {
								choiceBlock = workspace.newBlock(Defs.V_CHOICE_MOVE);
								const fromInput = jsonToExpressionBlock({ Zone: actionData.MoveCards.from }, workspace);
								const toInput = jsonToExpressionBlock({ Zone: actionData.MoveCards.to }, workspace);
								if (fromInput && choiceBlock.getInput(Defs.F_SOURCE)?.connection) { // SOURCE field
									choiceBlock.getInput(Defs.F_SOURCE)!.connection!.connect(fromInput.outputConnection!);
								}
								if (toInput && choiceBlock.getInput(Defs.F_DEST)?.connection) { // DEST field
									choiceBlock.getInput(Defs.F_DEST)!.connection!.connect(toInput.outputConnection!);
								}
							}
						}

						if (choiceBlock) {
							choiceBlock.initSvg();
							choiceBlock.render();
							if (previousChoiceConnection && choiceBlock.previousConnection) {
								previousChoiceConnection.connect(choiceBlock.previousConnection);
								previousChoiceConnection = choiceBlock.nextConnection;
							} else if (!previousChoiceConnection && choiceBlock.previousConnection) { // First choice
								console.error("Could not connect first choice, input connection is null");
							}
						}
					}

					const handleInput = caseBlock.getInput('ACTIONS');
					if (handleInput?.connection) {
						const handleBlock = jsonToStatementBlock(offerCase.handle, workspace, null);
						if (handleBlock?.previousConnection) {
							handleInput.connection.connect(handleBlock.previousConnection);
						}
					}

					caseBlock.render(); // Render after children are connected
					if (previousCaseConnection && caseBlock.previousConnection) {
						previousCaseConnection.connect(caseBlock.previousConnection);
						previousCaseConnection = caseBlock.nextConnection;
					} else if (!previousCaseConnection) {
						console.error("Could not connect first case, input connection is null");
					}
				}
				break;
			}
			default:
				console.warn(`Unhandled statement type: ${statementType}`, jsonStatement);
				return null;
		}

		if (currentBlock) {
			currentBlock.initSvg();
			currentBlock.render();
			if (previousBlockConnection && currentBlock.previousConnection) {
				try {
					previousBlockConnection.connect(currentBlock.previousConnection);
				} catch (e) {
					console.error("Connection failed:", e, "Previous:", previousBlockConnection.getSourceBlock().type, "Current:", currentBlock.type);
				}
			}
		}
		return currentBlock;
	}

	console.warn('jsonToStatementBlock received unexpected jsonStatement:', jsonStatement);
	return null;
};

// Define a more specific union type for expressions based on the AST.
// This will evolve as we implement more expression types.
type DeserializableExpression =
	| { Number: NumberExpression }
	| { Boolean: BooleanExpression }
	| { Player: PlayerExpression }
	| { PlayerCollection: PlayerCollectionExpression }
	| { Zone: ZoneExpression }
	| { ZoneCollection: ZoneCollectionExpression }
	| { Card: CardExpression }
	| { CardCollection: CardCollectionExpression }
	| { CardSet: CardSetExpression } // For GenerateCards CARDS field, not a block itself.
	| { Suit: SuitExpression }
	| { Rank: RankExpression }
	| { CardSelector: any }; // CardSelectorExpression - may not be directly mapped to a standalone block


function jsonToExpressionBlock(
	jsonExpression: DeserializableExpression | any, // Using 'any' temporarily for broader compatibility during dev
	workspace: Blockly.WorkspaceSvg,
): Blockly.Block | null {
	if (!jsonExpression || typeof jsonExpression !== 'object') {
		console.warn("Invalid or null expression received", jsonExpression);
		return null;
	}

	const categoryKey = Object.keys(jsonExpression)[0]; // e.g., "Number", "Boolean"
	const expressionDetails = jsonExpression[categoryKey]; // The actual expression content, e.g., { Literal: 5 } or "CurrentPlayer"

	if (!expressionDetails) {
		console.warn(`Expression category '${categoryKey}' has no details.`, jsonExpression);
		return null;
	}

	let block: Blockly.BlockSvg | null = null;

	switch (categoryKey) {
		case 'Number': {
			const numExpr = expressionDetails as NumberExpression;
			if (typeof numExpr === 'object' && 'Literal' in numExpr) {
				block = workspace.newBlock('math_number');
				block.setFieldValue(String(numExpr.Literal), 'NUM');
			} else if (typeof numExpr === 'object' && 'GetVariable' in numExpr) {
				block = workspace.newBlock(Defs.V_GET_NUMBER); // Assumes V_GET_NUMBER for number variables
				block.setFieldValue(numExpr.GetVariable, 'VAR_NAME');
			} else if (typeof numExpr === 'object' && 'CardsIn' in numExpr) {
				block = workspace.newBlock(Defs.V_NUM_CARDS);
				const cardCollectionInput = jsonToExpressionBlock({ CardCollection: numExpr.CardsIn }, workspace);
				if (cardCollectionInput && block.getInput('CARD_COLLECTION')?.connection) {
					block.getInput('CARD_COLLECTION')!.connection!.connect(cardCollectionInput.outputConnection!);
				}
			} else {
				console.warn(`Unhandled NumberExpression subtype:`, numExpr);
			}
			break;
		}
		case 'Boolean': {
			const boolExpr = expressionDetails as BooleanExpression;
			if (typeof boolExpr === 'object' && 'Literal' in boolExpr) {
				block = workspace.newBlock('logic_boolean');
				block.setFieldValue(boolExpr.Literal ? 'TRUE' : 'FALSE', 'BOOL');
			} else if (typeof boolExpr === 'object' && 'Comparison' in boolExpr) {
				block = workspace.newBlock('logic_compare'); // Standard Blockly compare block
				block.setFieldValue(boolExpr.Comparison.compared_to, 'OP'); // EQ, NEQ, LT, LTE, GT, GTE
				const inputA = jsonToExpressionBlock({ Number: boolExpr.Comparison.a }, workspace);
				const inputB = jsonToExpressionBlock({ Number: boolExpr.Comparison.b }, workspace);
				if (inputA && block.getInput('A')?.connection) {
					block.getInput('A')!.connection!.connect(inputA.outputConnection!);
				}
				if (inputB && block.getInput('B')?.connection) {
					block.getInput('B')!.connection!.connect(inputB.outputConnection!);
				}
			} else if (typeof boolExpr === 'object' && 'PlayerIsType' in boolExpr) {
				block = workspace.newBlock(Defs.V_PLAYER_OF_TYPE);
				const playerInput = jsonToExpressionBlock({ Player: boolExpr.PlayerIsType.player }, workspace);
				if (playerInput && block.getInput('PLAYER')?.connection) {
					block.getInput('PLAYER')!.connection!.connect(playerInput.outputConnection!);
				}
				// TYPE_NAME for V_PLAYER_OF_TYPE is a value input in defs.ts, expecting a block.
				// The JSON has type_name: string. This might need a text block or adjustment in custom block def.
				// For now, let's assume it might take a literal string block if available, or it's a dropdown.
				// The current block definition has a value input "TYPE_NAME" expecting "socs_t_player_class"
				// This implies type_name should be a variable of type socs_t_player_class.
				// The JSON "playerMoved" type_name example is a string, not a variable.
				// This needs clarification or a different block for direct string type names.
				// For now, setting as field, which might be wrong for V_PLAYER_OF_TYPE.
				// block.setFieldValue(boolExpr.PlayerIsType.type_name, 'TYPE_NAME_FIELD'); // If it were a field
				console.warn("PlayerIsType.type_name mapping needs review. JSON provides string, block expects input.", boolExpr.PlayerIsType);

			} else {
				console.warn(`Unhandled BooleanExpression subtype:`, boolExpr);
			}
			break;
		}
		case 'Player': {
			const playerExpr = expressionDetails as PlayerExpression;
			if (playerExpr === 'CurrentPlayer') {
				block = workspace.newBlock(Defs.V_PLAYER_CURRENT);
			} else if (typeof playerExpr === 'object' && 'GetVariable' in playerExpr) {
				block = workspace.newBlock(Defs.V_GET_UNIFIED);
				block.setFieldValue('socs_t_player', 'TYPE');
				block.setFieldValue(playerExpr.GetVariable, 'VARIABLE');
			} else {
				console.warn(`Unhandled PlayerExpression subtype:`, playerExpr);
			}
			break;
		}
		case 'PlayerCollection': {
			const pcExpr = expressionDetails as PlayerCollectionExpression;
			if (pcExpr === 'AllPlayers') {
				block = workspace.newBlock(Defs.V_PLAYERS_ALL);
			} else if (typeof pcExpr === 'object' && 'Single' in pcExpr) {
				// Delegate to PlayerExpression handler
				return jsonToExpressionBlock({ Player: pcExpr.Single }, workspace);
			} else if (typeof pcExpr === 'object' && 'GetVariable' in pcExpr) {
				block = workspace.newBlock(Defs.V_GET_UNIFIED);
				block.setFieldValue('socs_t_player_sel', 'TYPE');
				block.setFieldValue(pcExpr.GetVariable, 'VARIABLE');
			} else {
				console.warn(`Unhandled PlayerCollectionExpression subtype:`, pcExpr);
			}
			break;
		}
		case 'Zone': {
			console.log(`getting zone expression from ${JSON.stringify(expressionDetails)}`);
			const zoneExpr = expressionDetails as ZoneExpression;
			if (typeof zoneExpr === 'object' && 'OwnedByPlayer' in zoneExpr) {
				block = workspace.newBlock(Defs.B_ZONE_FOR_PLAYER);
				const playerInput = jsonToExpressionBlock({ Player: zoneExpr.OwnedByPlayer.player }, workspace);
				if (playerInput && block.getInput('PLAYER')?.connection) {
					block.getInput('PLAYER')!.connection!.connect(playerInput.outputConnection!);
				}
				block.setFieldValue(zoneExpr.OwnedByPlayer.zone_name, 'ZONE_NAME');
			} else if (typeof zoneExpr === 'object' && 'GetVariable' in zoneExpr) {
				block = workspace.newBlock(Defs.V_GET_UNIFIED);
				block.setFieldValue('socs_t_zone', 'TYPE');
				const varBlock = block.getField('VARIABLE')! as Blockly.FieldDropdown;
				// options aren't generated first so generate options
				varBlock.getOptions();

				block.setFieldValue(zoneExpr.GetVariable, 'VARIABLE');
			} else {
				console.warn(`Unhandled ZoneExpression subtype:`, zoneExpr);
			}
			break;
		}
		case 'ZoneCollection': {
			const zcExpr = expressionDetails as ZoneCollectionExpression;
			if (typeof zcExpr === 'object' && 'Single' in zcExpr) {
				return jsonToExpressionBlock({ Zone: zcExpr.Single }, workspace);
			} else if (typeof zcExpr === 'object' && 'OfType' in zcExpr) {
				block = workspace.newBlock(Defs.V_ZONES_OF_TYPE);
				block.setFieldValue(zcExpr.OfType, 'ZONE_TYPE');
			} else if (typeof zcExpr === 'object' && 'GetVariable' in zcExpr) {
				block = workspace.newBlock(Defs.V_GET_UNIFIED);
				// Assuming socs_t_zone_sel is the correct type for a collection variable
				block.setFieldValue('socs_t_zone_sel', 'TYPE');
				block.setFieldValue(zcExpr.GetVariable, 'VARIABLE');
			} else {
				console.warn(`Unhandled ZoneCollectionExpression subtype:`, zcExpr);
			}
			break;
		}
		case 'Card': {
			const cardExpr = expressionDetails as CardExpression;
			if (typeof cardExpr === 'object' && 'GetVariable' in cardExpr) {
				block = workspace.newBlock(Defs.V_GET_UNIFIED);
				block.setFieldValue('socs_t_card', 'TYPE');
				block.setFieldValue(cardExpr.GetVariable, 'VARIABLE');
			} else if (typeof cardExpr === 'object' && 'Create' in cardExpr) {
				console.warn("CardExpression.Create to block mapping not implemented yet.");
				// Requires a block like 'create_card_with_suit_rank'
			} else {
				console.warn(`Unhandled CardExpression subtype:`, cardExpr);
			}
			break;
		}
		case 'CardCollection': {
			const ccExpr = expressionDetails as CardCollectionExpression;
			if (typeof ccExpr === 'object' && 'Single' in ccExpr) {
				return jsonToExpressionBlock({ Card: ccExpr.Single }, workspace);
			} else if (typeof ccExpr === 'object' && 'GetVariable' in ccExpr) {
				block = workspace.newBlock(Defs.V_GET_UNIFIED);
				block.setFieldValue('socs_t_card_sel', 'TYPE');
				block.setFieldValue(ccExpr.GetVariable, 'VARIABLE');
			} else if (typeof ccExpr === 'object' && 'AllInZone' in ccExpr) {
				block = workspace.newBlock(Defs.V_CARD_SELECTOR);
				block.setFieldValue('ALL', 'SELECTOR');
				const zoneInput = jsonToExpressionBlock({ Zone: ccExpr.AllInZone }, workspace);
				if (zoneInput && block.getInput('ZONE')?.connection) {
					block.getInput('ZONE')!.connection!.connect(zoneInput.outputConnection!);
				}
			} else if (typeof ccExpr === 'object' && 'TopInZone' in ccExpr) {
				block = workspace.newBlock(Defs.V_CARD_SELECTOR);
				block.setFieldValue('TOP', 'SELECTOR');
				const zoneInput = jsonToExpressionBlock({ Zone: ccExpr.TopInZone }, workspace);
				if (zoneInput && block.getInput('ZONE')?.connection) {
					block.getInput('ZONE')!.connection!.connect(zoneInput.outputConnection!);
				}
			} else if (typeof ccExpr === 'object' && 'BottomInZone' in ccExpr) {
				block = workspace.newBlock(Defs.V_CARD_SELECTOR);
				block.setFieldValue('BOTTOM', 'SELECTOR');
				const zoneInput = jsonToExpressionBlock({ Zone: ccExpr.BottomInZone }, workspace);
				if (zoneInput && block.getInput('ZONE')?.connection) {
					block.getInput('ZONE')!.connection!.connect(zoneInput.outputConnection!);
				}
			} else if (typeof ccExpr === 'object' && 'InZoneMatchingSuit' in ccExpr) {
				block = workspace.newBlock(Defs.V_CARDS_MATCHING_SUIT);
				const zoneInput = jsonToExpressionBlock({ Zone: ccExpr.InZoneMatchingSuit.zone }, workspace);
				const suitInput = jsonToExpressionBlock({ Suit: ccExpr.InZoneMatchingSuit.suit }, workspace);
				if (zoneInput && block.getInput('ZONE')?.connection) {
					block.getInput('ZONE')!.connection!.connect(zoneInput.outputConnection!);
				}
				if (suitInput && block.getInput('SUIT')?.connection) {
					block.getInput('SUIT')!.connection!.connect(suitInput.outputConnection!);
				}
			} else if (typeof ccExpr === 'object' && 'InZoneMatchingRank' in ccExpr) {
				block = workspace.newBlock(Defs.V_CARDS_MATCHING_RANK);
				const zoneInput = jsonToExpressionBlock({ Zone: ccExpr.InZoneMatchingRank.zone }, workspace);
				const rankInput = jsonToExpressionBlock({ Rank: ccExpr.InZoneMatchingRank.rank }, workspace);
				if (zoneInput && block.getInput('ZONE')?.connection) {
					block.getInput('ZONE')!.connection!.connect(zoneInput.outputConnection!);
				}
				if (rankInput && block.getInput('RANK')?.connection) {
					block.getInput('RANK')!.connection!.connect(rankInput.outputConnection!);
				}
			} else {
				console.warn(`Unhandled CardCollectionExpression subtype:`, ccExpr);
			}
			break;
		}
		case 'Suit': {
			const suitExpr = expressionDetails as SuitExpression;
			if (typeof suitExpr === 'object' && 'Literal' in suitExpr) {
				// This likely sets a field on a consuming block, not a standalone block.
				// For V_CARDS_MATCHING_SUIT, the SUIT input expects a 'socs_t_suit' output type.
				// Need a block that outputs socs_t_suit and takes a literal.
				// Example: A 'suit_literal' block with a dropdown for Diamond, Club, etc.
				// This block doesn't seem to exist in defs.ts.
				console.warn("SuitExpression.Literal to block mapping not implemented (needs a 'suit_literal' block).", suitExpr.Literal);
			} else if (typeof suitExpr === 'object' && 'FromCard' in suitExpr) {
				block = workspace.newBlock(Defs.V_SUIT_FROM_CARD);
				const cardInput = jsonToExpressionBlock({ Card: suitExpr.FromCard }, workspace);
				if (cardInput && block.getInput('CARD')?.connection) {
					block.getInput('CARD')!.connection!.connect(cardInput.outputConnection!);
				}
			} else {
				console.warn(`Unhandled SuitExpression subtype:`, suitExpr);
			}
			break;
		}
		case 'Rank': {
			const rankExpr = expressionDetails as RankExpression;
			if (typeof rankExpr === 'object' && 'Literal' in rankExpr) {
				// Similar to SuitExpression.Literal, needs a 'rank_literal' block.
				console.warn("RankExpression.Literal to block mapping not implemented (needs a 'rank_literal' block).", rankExpr.Literal);
			} else if (typeof rankExpr === 'object' && 'FromCard' in rankExpr) {
				block = workspace.newBlock(Defs.V_RANK_FROM_CARD);
				const cardInput = jsonToExpressionBlock({ Card: rankExpr.FromCard }, workspace);
				if (cardInput && block.getInput('CARD')?.connection) {
					block.getInput('CARD')!.connection!.connect(cardInput.outputConnection!);
				}
			} else {
				console.warn(`Unhandled RankExpression subtype:`, rankExpr);
			}
			break;
		}
		case 'CardSet': // Used in GenerateCards, not a standalone expression block
			console.warn(`CardSetExpression should be handled by the consuming block (e.g., GenerateCards), not directly by jsonToExpressionBlock.`);
			return null;

		default:
			console.warn(`Unhandled expression category: ${categoryKey}`, jsonExpression);
			return null; // Explicitly return null for unhandled categories
	}

	if (block) {
		block.initSvg();
		block.render();
	}
	return block;
};

// Add console.warn for missing types if necessary, e.g.:
// if (typeof SomeType === 'undefined') {
//   console.warn("Type SomeType is not imported. Please check @bindings exports.");
// }

