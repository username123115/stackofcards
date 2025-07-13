# Stack of cards

WIP Web app for designing and playing card games made for a Hackclub event <br>
Currently on haitus, check out the live demo at [stackof.cards](https://stackof.cards)

# Language features


## Data types

Simple block based language with limited data types
- Player
- Player collection
- Card
- Card collection
- Zone
- Zone collection
- Number
- Suit
- Rank

### Players

Represents an active player or collection of players, can be accessed via variable name or selector

#### Player Class

- Each player belongs to exactly one class, which determines what zones they start with
- Class membership can be queried with the `player is` block

#### Player Template

- A set of zones can be specified to be initialized for a player on startup, these zones are associated with a name

#### Player Assignment

By default all player classes have assignment rule `All` which means any player is eligible for that class <br>
Setting the assignment rule to `index[n]` ensures that only the nth is eligble for that class <br>
<br>
You must specify the order the game tries to match players to classes, if the first class the game tries to match has priority `All`, then no other classes will be matched

### Cards

Represents a single/collection of initialized card(s), cards can be initialized anytime by using the `generate cards` block to add cards to a deck

#### Suit
Each card has a suit, the `suit of` block can be used to access this suit <br>
Suits can be used when filtering card collections <br>

#### Rank
Each card has a rank, the `rank of` block can be used to access this suit <br>
Ranks can be used when filtering card collections <br>

### Zones

Zones hold a collection of cards, they can be created and destroyed any time in the game

#### Zone Classes

Each zone belongs to a single class, this determines the patterns and visibility of that zone

#### Zone Patterns

A set of rules can be enforced on the cards in a zone called patterns, these patterns are applied when the zone is non empty and a player tries moving cards into the zone <br>
The set of patterns a zone enforces depends on the class it belongs to <br>

A pattern consists of multiple pattern parts, each pattern part enforces a specific rule <br>
There are three types of pattern parts <br>
- Suit : Enforces the suits a card collection must have (can have wild cards)
- Rank : Enforces the ranks a card collection must have (can have wild cards)
- Relation : Enforces numerical relation between cards in a collection (currently only a consecutive relation exists)

Each pattern part has to validate before a pattern is valid, a pattern can have an arbitrary number of pattern parts

#### Zone Visibility

A zone has two visibility rules, one for its owner and another for other players <br>
This can be set to `Visible`(all contents visible), `Hidden`(no contents visible), `Top`(top card only), or `Bottom`(bottom card only) <br>

#### Initial Zones

A set of zones can be specified to be initialized at game start, these zones can be referred to by name

## Orders

To order cards by rank, assign each rank a numerical value via an order <br>
These orders are used for pattern matching based on `Relation`s along with for comparing other cards <br>

## Variables

Only number variables can be read/written to, they have global scope

## Phases

Each game must have at least one initial phase, phases are sequences of block code that get ran by the interpreter <br>
The current phase can be changed any time <br>

## Input

To receive input from a player, use an `offer to` block, they require a player / player collection and a set of action blocks

### Action blocks

```only if <condition> choices [choice blocks] handle [statements]```

```choices [choice blocks] handle [statements]```

Choice blocks represent a basic action a player can take, such as selecting a card from a card collection <br>
Each action block requires the player to make a set of valid choices (do everything in the set of choice blocks) before running the handler statements <br>

The offer to block only runs the handler of one action block out of many, giving the player a set of actions they can choose

# What's working

- Block editor powered by Blockly
- Finished language / interpreter design
- User accounts
- Save and load block code (appears to be working but not properly tested)
- Load and start game lobby based on game spec

# What's not working

- Card creation using card sets
- Configuration / program validation
- Pattern matcher
- Interpreter
- Card game UI
- Actually playing games
