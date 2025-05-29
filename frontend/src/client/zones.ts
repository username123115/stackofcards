// TODO: 
// Record player actions to send to server

export type Rank = "Two" | "Three" | "Four" | "Five" | "Six" | "Seven" | "Eight" | "Nine" | "Ten" | "Jack" | "Queen" | "King" | "Ace";
export type Suit = "Hearts" | "Diamonds" | "Spades" | "Clubs";

export type ZoneDisplayMode = "Fan" | "Top" | "Deck";

export type CardId = String;

export type Card = {
	rank: Rank,
	suit: Suit,
	id: String,
}

export type Zone = {
	contents: Array<Card>,
	displayMode: ZoneDisplayMode,
	id: String,
}
