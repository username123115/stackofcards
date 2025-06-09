# Stack of cards

WIP Web app for designing and playing card games


## DSL

A DSL is in the process of being created for running games, it will rely heavily on built in language features
Below is an incomplete version of Gin Rummy that is being fleshed out along with the DSL itself as development progresses

```
Gin Rummy
Patterns
    Meld
        Set | Run
    Set (Three or more of same rank)
        Rank a3+
    Run (Four or more consecutive carads of same suite)
        Conesecutive 4+ && Suit a+
Zones
    Stock
        Rules : None
        Visibility : Owner
    Discard
        Rules : None
        Visibility : Owner

    PlayingDeck
        Rules : None
        Visibility : Owner
    Meld
        Rules : Meld
        Visibility : Public

Players
    RummyPlayer
        zones
            deck : PlayingDeck
        matching_rules : Match all

Initial_zones
    discard : Discard
    stock : Stock

Rummy phases
    Setup
        CreateCards ( { A234567890JQK, SCHD }, initial_zone(stock) )
        Shuffle ( initial_zone(stock) )
        Deal (initial_zone(stock), ZoneTarget (Player ( RummyPlayer, deck) ), 10)
        MoveTop (initial_zone(stock), initial_zone(discard))

    Play
```

