# Notes on design

  ruleset implementation goals:
    Go Fish
    Poker
    Dou dizhu

  AKA person with no language theory foundation tries making a language

  Should be a tree with actions?
  One of the most important resources in a game is a Zone
  The game needs to act on zones => Zones should be identifiable
  Zones will be created dynamicaly by the game interpreter
  Need a Zone describer that can identify a zone

  What should the ruleset specify? What's important in a Game?

  Initial set of cards - Won't change

  Deck setup - these are a set of instructions to assign cards


  Setup steps, user


 Interpreter reads a ruleset for go fish

 Ruleset:

    ZoneDefs


    Parsed tree set up
       .deck[Zone node](tag = #deck, template = {cards: @all, init: shuffle, visibility: top})
       .players[Zone container](tag = #players, template = {tag: #deck, cards: @empty, visibility: private, owner: @future}


 Init:

 Create a deck: +Zone tag: #deck; cards: @all
 Tree:
   #deck {2C, 2D, 2H, 2S, ..., AS}
   #player []

 range 2-5

 four players join

 Ruleset Builtin utilities (@)
 @all : cardset -> represents all 52 playing cards

 User input:

 Tree structure:
 Immutable tree defined at the beginning, each node can point to another node or a zone
 container as their children

ule layer dictates further restrictions on handling cards and zones defined in card layer




eneral ideas

ssumptions: Sequential play, players play in order one by one / only ask for one player to make
 move at a time

ontinuation: Support playing up until card exhaustion



ngine ideas

onditions: Win, Tie, Draw, Abort



ontinuation - Exits: Can the game continue if a player leaves?

## Card DSL AST Notes

Variables: During set up and other phases variables get initialized
Template Variables: Zone Template defines types, the interpreter will ask for a zone ID when
  - api
    - Templates
      - @DefineZone id ...args (Declare a new zone template, maps ) see ZoneTemplate
     - Zone Variables
      - @NewZone id

one Variables:

  - User uses api
  - '@declare deck id' -> Game will map a new variable called 'deck'
  - API: Expose zone `pick` and `add`,
  -
Player Variables:

instructions
@NewZone create a zone from an existing template
@SetMode change how tunrs work TODO implement later


Actions and Contexts: Players can perform actions, a Context is a Block that accepts and allows user input (Actions)
Context
  Allowed action - Specify some actions that the player is allowed to take, then write handlers that can handle
  these Actions

  Mandatory action - An action that must be taken by the player

Mandatory
  O

Action
  SelectRank
  SelectSuite

  PickCard

Checkpoint, Revert
  -

TODO: There seems to exist a view approaches to a DSL
[Towards a Unified Language for Card Game Design](https://dl.acm.org/doi/pdf/10.1145/3582437.3587185)
and
[BGD](https://essay.utwente.nl/79157/1/Schroten_BA_ewi.pdf)

I'll probably read these after I implement mine to look for improvements


Builtin Datatypes
  Arrays
  Functions?
Custom types? Lists? Filters?


implementation
Here is my wip implementation of Go Fish

Setup,
  2-5 players
  cards [23456789JQKA][HDCS]

ZoneTemplates,
  AllCards   [Globally owned, Shuffled, Private, 52 capacity]
  PlayerDeck [Player owned, Unordered, Private, No capacity]

PlayerZones
  deck = PlayerDeck

WinConditions {
  @player {
      pdeck(
  }
}

Contexts
GoFishTurn = @player {
  rank = ActionSelectRank(suites ( zones (@player, "deck") ) )
  next = selectPlayer(Modulo(1))

  if (zones (@player, "deck") )

}

## Handling Variables

Only store type information, the runner will initialize these later


# Concrete implementation

Typed language that revolves around the concept of Zones

# Exposed Datatypes

Number - Signed 32 bit integer
Rank - One of 13 ranks
Suit - One of 4 suites
ZoneRef - Reference to a Zone
PlayerRef - Reference to a Player

## Declaring

let $ar : ; -> DSLVariable(

Number: i32 = <s:r"[0-9]+"> => i32::from_str(s).unwrap();

# Internal Datatypes

A ruleset runtime is composed of a Card Set and multiple Zones
## Runtime
### Cardset

# Guards
Causes interpreter to log Actions, prevents other contexts from being entered (for asynchronous games like Rummy this forces players to wait)

# Game loop

At any stage, set up a list of contexts (List of actions + handler) and assign them to players

Player sends over their actions, server blocks other contexts and executes associated context

Repeat

# Actions

## Basic action

Select from [List]
Select from [Zone] 

Transfer from [Zone] to [Zone] (Guarded, undo)
