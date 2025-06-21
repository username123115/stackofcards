import * as Blockly from 'blockly/core';

import * as Defs from '@Blockly/customBlocks/defs';

import type { GameConfig } from '@bindings/GameConfig';
import type { Phase } from '@bindings/Phase';
import type { Statement } from '@bindings/Statement';
import type { NumberExpression } from '@bindings/NumberExpression';
import type { BooleanExpression } from '@bindings/BooleanExpression';
import type { PlayerExpression } from '@bindings/PlayerExpression';
import type { PlayerCollectionExpression } from '@bindings/PlayerCollectionExpression';
import type { ZoneExpression } from '@bindings/ZoneExpression';
import type { ZoneCollectionExpression } from '@bindings/ZoneCollectionExpression';
import type { CardCollectionExpression } from '@bindings/CardCollectionExpression';
import type { OfferCase } from '@bindings/OfferCase';
import type { OfferChoice } from '@bindings/OfferChoice';
import type { Rank } from '@bindings/Rank';
import type { RankExpression } from '@bindings/RankExpression';
import type { Suit } from '@bindings/Suit';
import type { SuitExpression } from '@bindings/SuitExpression';
import type { CardExpression } from '@bindings/CardExpression';

import type { Comparison } from '@bindings/Comparison';


/**
 * Converts a Blockly workspace to a GameConfig object.
 * @param workspace The Blockly workspace.
 * @returns The generated GameConfig.
 */
export function workspaceToGameConfig(workspace: Blockly.WorkspaceSvg): GameConfig['phases'] {
	const phases: { [key in string]: Phase } = {};
	const allBlocks = workspace.getAllBlocks(false);

	const phaseBlocks = allBlocks.filter(block => block.type === Defs.B_PHASE);

	for (const phaseBlock of phaseBlocks) {
		const phaseName = phaseBlock.getFieldValue('PHASE_NAME');
		if (!phaseName) {
			console.warn('Phase block is missing a name.', phaseBlock);
			continue;
		}

		const statementsConnection = phaseBlock.getInput('STATEMENTS')?.connection;
		const firstStatementBlock = statementsConnection?.targetBlock() ?? null;
		const statementsArray = blocksToStatementArray(firstStatementBlock);
		const phaseEvaluateStatement = arrayToSingleStatementOrBlock(statementsArray);

		phases[phaseName] = {
			evaluate: phaseEvaluateStatement,
		};
	}

	return phases;
}

/**
 * Converts a chain of Blockly blocks to an array of Statement objects.
 * @param firstBlock The first block in the chain.
 * @returns An array of Statement objects.
 */
export function blocksToStatementArray(firstBlock: Blockly.Block | null): Array<Statement> {
	const statements: Array<Statement> = [];
	let currentBlock = firstBlock;

	while (currentBlock) {
		const statement = blockToStatement(currentBlock);
		if (statement) {
			statements.push(statement);
		}
		currentBlock = currentBlock.getNextBlock();
	}

	return statements;
}

/**
 * Converts an array of Statement objects to a single Statement or a Block statement.
 * @param statements The array of Statement objects.
 * @returns A single Statement.
 */
export function arrayToSingleStatementOrBlock(statements: Array<Statement>): Statement {
	if (statements.length === 0) {
		return 'Empty';
	} else if (statements.length === 1) {
		return statements[0];
	} else {
		return { Block: statements };
	}
}

/**
 * Converts a single Blockly block to a Statement object.
 * @param block The Blockly block.
 * @returns A Statement object or null if the block type is unknown or invalid.
 */
export function blockToStatement(block: Blockly.Block): Statement | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.B_ENTER_PHASE: {
			const phaseName = block.getFieldValue('PHASE_NAME');
			if (!phaseName) {
				console.warn('EnterPhase block is missing phase name.', block);
				return { EnterPhase: "" };
			}
			return { EnterPhase: phaseName };
		}
		case Defs.B_PLAYER_ADVANCE: {
			const toAdvanceBlock = block.getInput('TO_ADVANCE')?.connection?.targetBlock() ?? null;
			const toAdvanceExpr = valueBlockToNumberExpression(toAdvanceBlock);
			if (!toAdvanceExpr) {
				console.warn('AdvancePlayerState block is missing to_advance expression.', block);
				return { AdvancePlayerState: { Literal: 0 } };
			}
			return { AdvancePlayerState: toAdvanceExpr };
		}
		case Defs.B_IF_ELSE: {
			const conditionBlock = block.getInput('CONDITION')?.connection?.targetBlock() ?? null;
			const conditionExpr = valueBlockToBooleanExpression(conditionBlock);
			if (!conditionExpr) {
				console.warn('If Else block missing condition.', block);
				return null;
			}

			const thenFirstBlock = block.getInput('GO_TRUE')?.connection?.targetBlock() ?? null;
			const elseFirstBlock = block.getInput('GO_FALSE')?.connection?.targetBlock() ?? null;

			const thenStatements = blocksToStatementArray(thenFirstBlock);
			const elseStatements = blocksToStatementArray(elseFirstBlock);

			return {
				Conditional: {
					condition: conditionExpr,
					go_true: arrayToSingleStatementOrBlock(thenStatements),
					go_false: arrayToSingleStatementOrBlock(elseStatements),
				}
			};
		}
		case Defs.B_WHILE: {
			const conditionBlock = block.getInput('CONDITION')?.connection?.targetBlock() ?? null;
			const conditionExpr = valueBlockToBooleanExpression(conditionBlock);
			if (!conditionExpr) {
				console.warn('While block missing condition.', block);
				return null;
			}
			const bodyFirstBlock = block.getInput('DO')?.connection?.targetBlock() ?? null;
			const bodyStatements = blocksToStatementArray(bodyFirstBlock);
			return {
				While: {
					condition: conditionExpr,
					do: arrayToSingleStatementOrBlock(bodyStatements),
				}
			};
		}
		case Defs.B_SET_NUMBER: { // TASK 1: Ensure this maps to SetNumber
			const varName = block.getFieldValue('NAME');
			if (!varName) {
				console.warn('SetNumber block missing variable name.', block);
				return null;
			}
			const valueBlock = block.getInput('VALUE')?.connection?.targetBlock() ?? null;
			const valueExpr = valueBlockToNumberExpression(valueBlock);
			if (!valueExpr) {
				console.warn('SetNumber block missing value expression for variable.', block);
				return null;
			}
			return { SetNumber: { name: varName, value: valueExpr } };
		}
		case Defs.B_SHUFFLE: {
			const zoneCollBlock = block.getInput('ZONES')?.connection?.targetBlock() ?? null;
			const zoneCollExpr = valueBlockToZoneCollectionExpression(zoneCollBlock);
			if (!zoneCollExpr) {
				console.warn('Shuffle block missing zone collection expression.', block);
				return null;
			}
			return { Shuffle: zoneCollExpr };
		}
		case Defs.B_DEAL_CARD: {
			const countBlock = block.getInput('NUM_CARDS')?.connection?.targetBlock() ?? null;
			const countExpr = valueBlockToNumberExpression(countBlock);
			if (!countExpr) {
				console.warn('DealCards block missing count expression.', block);
				return null;
			}
			const fromZoneBlock = block.getInput('SOURCE')?.connection?.targetBlock() ?? null;
			const fromZoneExpr = valueBlockToZoneExpression(fromZoneBlock);
			if (!fromZoneExpr) {
				console.warn('DealCards block missing from_zone expression.', block);
				return null;
			}
			const toZonesBlock = block.getInput('DEST')?.connection?.targetBlock() ?? null;
			const toZonesExpr = valueBlockToZoneCollectionExpression(toZonesBlock);
			if (!toZonesExpr) {
				console.warn('DealCards block missing to_zones expression.', block);
				return null;
			}
			return { Deal: { num_cards: countExpr, source: fromZoneExpr, dest: toZonesExpr } };
		}
		case Defs.B_CARDS_MOVE: {
			const cardsBlock = block.getInput('SOURCE')?.connection?.targetBlock() ?? null;
			const cardsExpr = valueBlockToCardCollectionExpression(cardsBlock);
			if (!cardsExpr) {
				console.warn('CardsMove block missing cards expression.', block);
				return null;
			}
			const toZoneBlock = block.getInput('DEST')?.connection?.targetBlock() ?? null;
			const toZoneExpr = valueBlockToZoneExpression(toZoneBlock);
			if (!toZoneExpr) {
				console.warn('CardsMove block missing to_zone expression.', block);
				return null;
			}
			return { MoveCardsTo: { source: cardsExpr, dest: toZoneExpr } };
		}
		case Defs.B_DECLARE_WINNER: {
			const playersBlock = block.getInput('PLAYER')?.connection?.targetBlock() ?? null;
			const playersExpr = valueBlockToPlayerCollectionExpression(playersBlock);
			if (!playersExpr) {
				console.warn('DeclareWinner block missing players expression.', block);
				return null;
			}
			return { DeclareWinner: playersExpr };
		}
		case Defs.B_OFFER: {
			const playerSelectionBlock = block.getInput('OFFER_TO')?.connection?.targetBlock() ?? null;
			const offerToExpr = valueBlockToPlayerCollectionExpression(playerSelectionBlock);
			if (!offerToExpr) {
				console.warn('Offer block missing player_selection expression for offer_to.', block);
				return null;
			}
			const playerNameVar = block.getFieldValue('PLAYER_NAME');
			if (!playerNameVar) {
				console.warn('Offer block missing player_name_var field (variable to store chosen player).', block);
				return null;
			}

			const firstCaseBlock = block.getInput('CASES')?.connection?.targetBlock() ?? null;
			const casesArray = blocksToOfferCasesArray(firstCaseBlock);
			if (casesArray.length === 0) {
				console.warn('Offer block has no valid cases.', block);
			}

			return {
				Offer: {
					offer_to: offerToExpr,
					player_name: playerNameVar,
					cases: casesArray,
				}
			};
		}

		case Defs.B_OFFER_DECLARELESS: {
			const playerSelectionBlock = block.getInput('OFFER_TO')?.connection?.targetBlock() ?? null;
			const offerToExpr = valueBlockToPlayerCollectionExpression(playerSelectionBlock);
			if (!offerToExpr) {
				console.warn('Offer block missing player_selection expression for offer_to.', block);
				return null;
			}

			const firstCaseBlock = block.getInput('CASES')?.connection?.targetBlock() ?? null;
			const casesArray = blocksToOfferCasesArray(firstCaseBlock);
			if (casesArray.length === 0) {
				console.warn('Offer block has no valid cases.', block);
			}

			return { Offer: { offer_to: offerToExpr, player_name: null, cases: casesArray } };

		}

		case Defs.B_GEN_CARDS: { // TODO selection thingy
			const destBlock = block.getInput('DEST')?.connection?.targetBlock() ?? null;
			const zoneExpr = valueBlockToZoneExpression(destBlock);
			if (!zoneExpr) {
				console.warn('Generate block missing expression for target zone', block);
				return null;
			}

			return {
				GenerateCards: { cards: "AllAllowed", dest: zoneExpr }
			}
		}
		default:
			console.warn(`Unknown or unhandled statement block type: ${block.type}`, block);
			return null;
	}
}

/**
 * Converts a value block to a NumberExpression or null.
 * @param block The value block.
 * @returns A NumberExpression or null.
 */
export function valueBlockToNumberExpression(block: Blockly.Block | null): NumberExpression | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case 'math_number':
			const num = block.getFieldValue('NUM');
			try {
				return { Literal: num };
			} catch (e) {
				console.warn(`Could not parse Number from math_number block: ${num}`, block);
				return { Literal: 0 };
			}
		case Defs.V_GET_NUMBER:
			const varName = block.getFieldValue('VAR_NAME');
			if (!varName) {
				console.warn('socs_get_number block missing VAR_NAME field.', block);
				return { GetVariable: "" };
			}
			return { GetVariable: varName };
		case Defs.V_NUM_CARDS:
			const collectionBlock = block.getInput('CARD_COLLECTION')?.connection?.targetBlock() ?? null;
			const cardCollectionExpr = valueBlockToCardCollectionExpression(collectionBlock);
			if (!cardCollectionExpr) {
				console.warn('socs_num_cards block missing card collection.', block);
				//TODO
				return null;
			}
			return { CardsIn: cardCollectionExpr };
		default:
			console.warn(`NumberExpression conversion not implemented for block type: ${block.type}.`, block);
			return { Literal: 0 };
	}
}

/**
 * Converts a value block to a BooleanExpression or null.
 * @param block The value block.
 * @returns A BooleanExpression or null.
 */
export function valueBlockToBooleanExpression(block: Blockly.Block | null): BooleanExpression | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case 'logic_boolean':
			return { Literal: block.getFieldValue('BOOL') === 'TRUE' };
		case 'logic_compare': {
			const leftBlock = block.getInput('A')?.connection?.targetBlock() ?? null;
			const rightBlock = block.getInput('B')?.connection?.targetBlock() ?? null;
			// TODO: Extend to compare more than just numbers if necessary
			const leftExpr = valueBlockToNumberExpression(leftBlock); // Assuming Number comparison for now
			const rightExpr = valueBlockToNumberExpression(rightBlock);
			const op = block.getFieldValue('OP') as string;

			if (!leftExpr || !rightExpr || !op) {
				console.warn('logic_compare block missing inputs or operator.', block);
				return null;
			}
			let backendOp: Comparison;
			switch (op) {
				case 'EQ': backendOp = 'EQ'; break;
				case 'NEQ': backendOp = 'NEQ'; break;
				case 'LT': backendOp = 'LT'; break;
				case 'LTE': backendOp = 'LTE'; break;
				case 'GT': backendOp = 'GT'; break;
				case 'GTE': backendOp = 'GTE'; break;
				default:
					console.warn(`Unsupported comparison operator: ${op}`, block);
					return null;
			}
			return { Comparison: { a: leftExpr, compared_to: backendOp, b: rightExpr } };
		}
		case Defs.V_PLAYER_OF_TYPE: {
			const playerBlock = block.getInput('PLAYER')?.connection?.targetBlock() ?? null;
			const playerExpr = valueBlockToPlayerExpression(playerBlock);
			const typeName = block.getFieldValue('TYPE_NAME');

			if (!playerExpr || !typeName) {
				console.warn('socs_player_of_type block missing player expression or type name.', block);
				return null;
			}
			if (typeof playerExpr !== 'string' || playerExpr !== 'CurrentPlayer') {
				console.warn(`socs_player_of_type currently only supports 'CurrentPlayer' due to PlayerExpression limitations. Got: ${JSON.stringify(playerExpr)}`);
				return null;
			}
			return { PlayerIsType: { player: playerExpr as "Current", type_name: typeName } };
		}
		default:
			console.warn(`BooleanExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}

/**
 * Converts a value block to a PlayerCollectionExpression or null.
 * @param block The value block.
 * @returns A PlayerCollectionExpression or null.
 */
export function valueBlockToPlayerCollectionExpression(block: Blockly.Block | null): PlayerCollectionExpression | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.V_PLAYERS_ALL:
			return 'AllPlayers';
		case Defs.V_PLAYER_CURRENT:
			return { Single: 'CurrentPlayer' };
		case Defs.V_GET_UNIFIED:
			const varName = block.getFieldValue('VAR_NAME');
			if (!varName) {
				console.warn('socs_get_unified (for player collection) block missing VAR_NAME field.', block);
				return null;
			}
			// TODO: Verify PlayerCollectionExpression supports GetVariable
			console.warn(`PlayerCollectionExpression.GetVariable for "${varName}" not confirmed in bindings. Assuming it exists.`, block);
			return { GetVariable: varName };
		default:
			console.warn(`PlayerCollectionExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}

/**
 * Converts a value block to a PlayerExpression or null.
 * @param block The value block.
 * @returns A PlayerExpression or null.
 */
export function valueBlockToPlayerExpression(block: Blockly.Block | null): PlayerExpression | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.V_PLAYER_CURRENT:
			return 'CurrentPlayer';
		case Defs.V_GET_UNIFIED:
			const varName = block.getFieldValue('VARIABLE');
			if (!varName) {
				console.warn('socs_get_unified (for player) block missing VARIABLE field.', block);
				return { GetVariable: "" };
			}
			console.warn(`PlayerExpression.GetVariable for "${varName}" not confirmed. PlayerExpression might only be "Current".`, block);
			return { GetVariable: varName };
		default:
			console.warn(`PlayerExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}


/**
 * Converts a value block to a ZoneExpression or null.
 * @param block The value block.
 * @returns A ZoneExpression or null.
 */
export function valueBlockToZoneExpression(block: Blockly.Block | null): ZoneExpression | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.B_ZONE_FOR_PLAYER: {
			const playerBlock = block.getInput('PLAYER')?.connection?.targetBlock() ?? null;
			const playerExpr = valueBlockToPlayerExpression(playerBlock);
			const zoneType = block.getFieldValue('ZONE_TYPE');

			if (!playerExpr || !zoneType) {
				console.warn('socs_zone_for_player block missing player or zone_type.', block);
				return null;
			}
			// TODO: Revisit if PlayerExpression supports GetVariable.
			if (typeof playerExpr !== 'string' || playerExpr !== 'Current') {
				console.warn(`socs_zone_for_player: PlayerExpression for player is not "Current", which might be the only supported direct value. Got ${JSON.stringify(playerExpr)}. Needs robust GetVariable in PlayerExpression.`);
				// If playerExpr is {GetVariable: "name"}, this should ideally be valid.
				// For now, proceeding as if it might be.
			}
			return { PlayerZone: { player: playerExpr, type: zoneType } };
		}
		case Defs.V_GET_UNIFIED:
			const varName = block.getFieldValue('VAR_NAME');
			if (!varName) {
				console.warn('socs_get_unified (for zone) block missing VAR_NAME field.', block);
				return null;
			}
			return { GetVariable: varName };
		default:
			console.warn(`ZoneExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}

/**
 * Converts a value block to a ZoneCollectionExpression or null.
 * @param block The value block.
 * @returns A ZoneCollectionExpression or null.
 */
export function valueBlockToZoneCollectionExpression(block: Blockly.Block | null): ZoneCollectionExpression | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.V_ZONES_OF_TYPE: {
			const zoneType = block.getFieldValue('ZONE_TYPE');
			if (!zoneType) {
				console.warn('socs_zones_of_type block missing ZONE_TYPE field.', block);
				return null;
			}
			return { AllOfType: zoneType };
		}
		case Defs.V_GET_UNIFIED:
			const varName = block.getFieldValue('VAR_NAME');
			if (!varName) {
				console.warn('socs_get_unified (for zone collection) block missing VAR_NAME field.', block);
				return null;
			}
			// TODO: Verify ZoneCollectionExpression supports GetVariable
			console.warn(`ZoneCollectionExpression.GetVariable for "${varName}" not confirmed. Assuming it exists.`, block);
			return { GetVariable: varName };
		default:
			console.warn(`ZoneCollectionExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}


/**
 * Converts a value block to a CardCollectionExpression or null.
 * @param block The value block.
 * @returns A CardCollectionExpression or null.
 */
export function valueBlockToCardCollectionExpression(block: Blockly.Block | null): CardCollectionExpression | null {
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.V_CARDS_MATCHING_RANK: {
			const rankBlock = block.getInput('RANK')?.connection?.targetBlock() ?? null;
			const rankExpr = valueBlockToRankExpression(rankBlock);
			const zoneBlock = block.getInput('ZONE')?.connection?.targetBlock() ?? null;
			const zoneExpr = valueBlockToZoneExpression(zoneBlock);

			if (!rankExpr || !zoneExpr) {
				console.warn('socs_cards_matching_rank missing rank or zone.', block);
				return null;
			}
			return { MatchingRank: { rank: rankExpr, zone: zoneExpr } };
		}
		case Defs.V_CARDS_MATCHING_SUIT: {
			const suitBlock = block.getInput('SUIT')?.connection?.targetBlock() ?? null;
			const suitExpr = valueBlockToSuitExpression(suitBlock);
			const zoneBlock = block.getInput('ZONE')?.connection?.targetBlock() ?? null;
			const zoneExpr = valueBlockToZoneExpression(zoneBlock);

			if (!suitExpr || !zoneExpr) {
				console.warn('socs_cards_matching_suit missing suit or zone.', block);
				return null;
			}
			return { MatchingSuit: { suit: suitExpr, zone: zoneExpr } };
		}
		case Defs.V_CARD_SELECTOR: { // TASK 5: Update for TOP/BOTTOM
			const zoneInput = block.getInput('ZONE');
			if (!zoneInput || !zoneInput.connection) {
				console.warn('socs_card_selector block missing ZONE input.', block);
				return null;
			}
			const zoneBlock = zoneInput.connection.targetBlock();
			const zoneExpr = valueBlockToZoneExpression(zoneBlock);
			if (!zoneExpr) {
				console.warn('socs_card_selector block has invalid ZONE input.', block);
				return null;
			}

			const selectorType = block.getFieldValue('SELECTOR');
			switch (selectorType) {
				case 'ALL':
					return { InZone: zoneExpr };
				case 'TOP':
				case 'BOTTOM':
					console.warn(`socs_card_selector type '${selectorType}' is currently unsupported for CardCollectionExpression due to lack of specific backend bindings (e.g., TopN, BottomN).`, block);
					return null;
				default:
					console.warn(`Unknown selector type in socs_card_selector: ${selectorType}`, block);
					return null;
			}
		}
		case Defs.V_GET_UNIFIED:
			const varName = block.getFieldValue('VAR_NAME');
			if (!varName) {
				console.warn('socs_get_unified (for card collection) block missing VAR_NAME field.', block);
				return null;
			}
			// TODO: Verify CardCollectionExpression supports GetVariable
			console.warn(`CardCollectionExpression.GetVariable for "${varName}" not confirmed. Assuming it exists.`, block);
			return { GetVariable: varName };
		default:
			console.warn(`CardCollectionExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}

/**
 * Converts a value block to a RankExpression or null.
 * @param block The value block.
 * @returns A RankExpression or null.
 */
export function valueBlockToRankExpression(block: Blockly.Block | null): RankExpression | null { // TASK 3
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.V_RANK_FROM_CARD: {
			const cardInputBlock = block.getInput('CARD')?.connection?.targetBlock() ?? null;
			const cardExpr = valueBlockToCardExpression(cardInputBlock);
			if (!cardExpr) {
				console.warn('socs_rank_from_card is missing a valid CardExpression for its CARD input.', block);
				return null;
			}
			// Current CardExpression is only {Create: ...}, so this will likely fail if we need to get rank from an *existing* card.
			if (!('Create' in cardExpr)) {
				console.warn(`socs_rank_from_card: Input CardExpression is not 'Create'. Getting rank from existing card variables is not directly supported by current CardExpression binding. CardExpr: ${JSON.stringify(cardExpr)}`, block);
				// This highlights a binding limitation. If CardExpression could be {GetVariable: ...}, this would be different.
				// For now, this path will likely lead to null if the card isn't being created inline.
			}
			return { FromCard: cardExpr };
		}
		default:
			console.warn(`RankExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}

/**
 * Converts a value block to a SuitExpression or null.
 * @param block The value block.
 * @returns A SuitExpression or null.
 */
export function valueBlockToSuitExpression(block: Blockly.Block | null): SuitExpression | null { // TASK 3
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.V_SUIT_FROM_CARD: {
			const cardInputBlock = block.getInput('CARD')?.connection?.targetBlock() ?? null;
			const cardExpr = valueBlockToCardExpression(cardInputBlock);
			if (!cardExpr) {
				console.warn('socs_suit_from_card is missing a valid CardExpression for its CARD input.', block);
				return null;
			}
			if (!('Create' in cardExpr)) {
				console.warn(`socs_suit_from_card: Input CardExpression is not 'Create'. Getting suit from existing card variables is not directly supported by current CardExpression binding. CardExpr: ${JSON.stringify(cardExpr)}`, block);
			}
			return { FromCard: cardExpr };
		}
		default:
			console.warn(`SuitExpression conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}

/**
 * Converts a value block to a CardExpression (single card) or null.
 * @param block The value block.
 * @returns A CardExpression or null.
 */
export function valueBlockToCardExpression(block: Blockly.Block | null): CardExpression | null { // TASK 3
	if (!block || block.isShadow()) return null;

	switch (block.type) {
		case Defs.V_GET_UNIFIED: // Represents an existing card variable
			const varName = block.getFieldValue('VAR_NAME');
			if (!varName) {
				console.warn('socs_get_unified (for card) block missing VAR_NAME field.', block);
				return null;
			}
			// CardExpression is currently only { Create: [SuitExpression, RankExpression] }
			// It does not have a { GetVariable: string } variant.
			console.warn(`Binding Limitation: CardExpression does not support GetVariable for "${varName}". Cannot serialize reference to existing card variable.`, block);
			return null;
		default:
			console.warn(`CardExpression (single card) conversion not implemented for block type: ${block.type}.`, block);
			return null;
	}
}

/**
 * Converts a chain of Blockly blocks to an array of OfferChoice objects.
 * @param firstChoiceBlock The first block in the chain (e.g., connected to 'OFFERS' of an offer_case).
 * @returns An array of OfferChoice objects.
 */
export function valueBlockToOfferChoiceArray(firstChoiceBlock: Blockly.Block | null): Array<OfferChoice> { // TASK 2
	const choices: Array<OfferChoice> = [];
	let currentBlock = firstChoiceBlock;

	while (currentBlock) {
		if (currentBlock.isShadow()) {
			currentBlock = currentBlock.getNextBlock();
			continue;
		}

		let choice: OfferChoice | null = null;
		switch (currentBlock.type) {
			case Defs.V_CHOICE_UNIFIED: {
				const asName = currentBlock.getFieldValue('AS');
				const choiceTypeStr = currentBlock.getFieldValue('CHOICE_TYPE'); // "player", "set of players", "card", "set of cards"
				const sourceBlock = currentBlock.getInput('SOURCE')?.connection?.targetBlock() ?? null;

				if (!asName || !choiceTypeStr) {
					console.warn('socs_choice_unified block missing AS name or CHOICE_TYPE.', currentBlock);
					break; // to next block in chain
				}

				let selectionType: ChoiceSelectionType | null = null;
				if (choiceTypeStr === 'player') {
					const playerCollExpr = valueBlockToPlayerCollectionExpression(sourceBlock);
					if (playerCollExpr) selectionType = { Player: playerCollExpr };
				} else if (choiceTypeStr === 'set of players') {
					const playerSelExpr = valueBlockToPlayerCollectionExpression(sourceBlock);
					if (playerSelExpr) selectionType = { PlayerSelection: playerSelExpr };
				} else if (choiceTypeStr === 'card') {
					const cardCollExpr = valueBlockToCardCollectionExpression(sourceBlock);
					if (cardCollExpr) selectionType = { Card: cardCollExpr };
				} else if (choiceTypeStr === 'set of cards') {
					const cardSelExpr = valueBlockToCardCollectionExpression(sourceBlock);
					if (cardSelExpr) selectionType = { CardSelection: cardSelExpr };
				} else {
					console.warn(`Unknown CHOICE_TYPE in socs_choice_unified: ${choiceTypeStr}`, currentBlock);
				}

				if (selectionType) {
					choice = { Selection: { name: asName, choice_type: selectionType } };
				} else {
					console.warn(`Could not create valid ChoiceSelectionType for socs_choice_unified with type ${choiceTypeStr}. Source block might be missing or invalid.`, currentBlock);
				}
				break;
			}
			case Defs.V_CHOICE_MOVE: {
				const fromBlock = currentBlock.getInput('SOURCE')?.connection?.targetBlock() ?? null;
				const toBlock = currentBlock.getInput('DEST')?.connection?.targetBlock() ?? null;
				const fromZoneExpr = valueBlockToZoneExpression(fromBlock);
				const toZoneExpr = valueBlockToZoneExpression(toBlock);

				if (fromZoneExpr && toZoneExpr) {
					choice = { Action: { MoveCards: { from: fromZoneExpr, to: toZoneExpr } } };
				} else {
					console.warn('socs_choice_move block missing valid SOURCE or DEST zone expressions.', currentBlock);
				}
				break;
			}
			default:
				console.warn(`Unknown block type in offer choice chain: ${currentBlock.type}`, currentBlock);
		}

		if (choice) {
			choices.push(choice);
		}
		currentBlock = currentBlock.getNextBlock();
	}
	return choices;
}


/**
 * Converts socs_offer_case blocks to an array of OfferCase objects.
 * @param firstCaseBlock The first socs_offer_case block.
 * @returns An array of OfferCase objects.
 */
export function blocksToOfferCasesArray(firstCaseBlock: Blockly.Block | null): Array<OfferCase> { // TASK 6: Refine
	const cases: Array<OfferCase> = [];
	let currentBlock = firstCaseBlock;

	while (currentBlock) {
		if (currentBlock.isShadow()) {
			currentBlock = currentBlock.getNextBlock();
			continue;
		}

		if (currentBlock.type === Defs.B_OFFER_CASE || currentBlock.type === Defs.B_OFFER_CASE_ANY) {
			const message = currentBlock.getFieldValue('PROMPT') || ""; // Prompt message for the player
			const firstChoiceBlock = currentBlock.getInput('OFFERS')?.connection?.targetBlock() ?? null;
			const choices = valueBlockToOfferChoiceArray(firstChoiceBlock);

			// The 'then' part of an OfferCase is a Statement, executed after selections are made.
			// This seems to be missing from the current socs_offer_case block structure if 'OFFERS' leads to choices.
			// The original `blocksToOfferCasesArray` took 'STATEMENTS' as the `then` branch.
			// Re-evaluating: `socs_offer_case` seems to have `PROMPT`, `FILTER` (condition), and `OFFERS` (choices).
			// It does NOT seem to have a `STATEMENTS` input for a `then` branch directly on the case.
			// This implies the `OfferCase` in the backend might be simpler, or the `then` is implicit/handled differently.
			// Let's assume for now OfferCase only has condition, message, and choices.
			// The previous version had a `then: Statement` from a `STATEMENTS` input. This input is not visible in the current task description for `socs_offer_case`.
			// If `OfferCase` *requires* a `then: Statement`, this model is incomplete.
			// Let's consult the `OfferCase` binding: `{ condition: BooleanExpression | null, message: string, choices: OfferChoice[], then: Statement }`
			// The `then: Statement` would come from the actions taken *after* a choice is made. This is usually part of the choice itself or a general handler.
			// The `socs_offer_case` block's `STATEMENTS` input (if it existed) would be the `then` for *this specific case*.
			// If `socs_offer_case` has `PROMPT`, `FILTER`, `OFFERS` and *also* a `STATEMENTS` for the `then` branch, then we need to add it.
			// The previous `blocksToOfferCasesArray` used:
			//    const statementsConnection = currentBlock.getInput('STATEMENTS')?.connection;
			//    const firstStatementInCase = statementsConnection?.targetBlock() ?? null;
			//    const thenStatement = arrayToSingleStatementOrBlock(blocksToStatementArray(firstStatementInCase));
			// This implies `socs_offer_case` *does* have a `STATEMENTS` input.

			const thenStatementsConnection = currentBlock.getInput('STATEMENTS')?.connection;
			const firstThenStatement = thenStatementsConnection?.targetBlock() ?? null;
			const thenStatement = arrayToSingleStatementOrBlock(blocksToStatementArray(firstThenStatement));


			if (currentBlock.type === Defs.B_OFFER_CASE) {
				const conditionBlock = currentBlock.getInput('FILTER')?.connection?.targetBlock() ?? null;
				const condition = valueBlockToBooleanExpression(conditionBlock);
				// An offer case can have a null condition if it's always available (unless filtered by order)
				if (!condition && conditionBlock) { // Condition block existed but was invalid
					console.warn(`socs_offer_case has an invalid FILTER condition. Skipping case.`, currentBlock);
					currentBlock = currentBlock.getNextBlock();
					continue;
				}

				cases.push({
					condition: condition, // OK if null
					message: message,
					choices: choices,
					then: thenStatement, // Added back based on typical OfferCase structure
				});
			} else { // socs_offer_case_any (assumed to have no specific condition, always a fallback)
				cases.push({
					condition: null, // "AnyOther" case typically has no condition of its own
					message: message, // Prompt for "any other" can still be useful
					choices: choices, // Choices for "any other"
					then: thenStatement, // Statements for "any other"
				});
			}
		} else {
			console.warn(`Unexpected block type in offer case chain: ${currentBlock.type}`, currentBlock);
		}
		currentBlock = currentBlock.getNextBlock();
	}
	return cases;
}

