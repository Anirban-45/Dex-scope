import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Pokemon } from "@/types/pokemon";
import { fetchRandomPokemon } from "@/services/pokemonApi";
import QuizCard from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, RotateCcw, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const Index = () => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [generation, setGeneration] = useState<string>("all");
  const [strongOnly, setStrongOnly] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const {
    toast
  } = useToast();

  // Fuzzy match function for spelling tolerance
  const fuzzyMatch = (guess: string, target: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const g = normalize(guess);
    const t = normalize(target);

    // Exact match
    if (g === t) return true;

    // Allow up to 2 character differences for longer names
    if (t.length > 5) {
      let differences = 0;
      const maxLen = Math.max(g.length, t.length);
      for (let i = 0; i < maxLen; i++) {
        if (g[i] !== t[i]) differences++;
        if (differences > 2) return false;
      }
      return differences <= 2;
    }
    return false;
  };
  const generateQuestion = async () => {
    setLoading(true);
    setRevealed(false);
    setFeedback(null);
    setHintLevel(0);
    setRevealedLetters(0);
    setShowLetterModal(false);
    try {
      const gen = generation === "all" ? undefined : parseInt(generation);
      const minBST = strongOnly ? 450 : undefined;
      const newPokemon = await fetchRandomPokemon(gen, minBST);
      setPokemon(newPokemon);
    } catch (error) {
      console.error("Error fetching Pokémon:", error);
      toast({
        title: "Error",
        description: "Failed to load Pokémon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    generateQuestion();
  }, [generation, strongOnly]);
  const handleGuess = (guess: string) => {
    if (!pokemon || revealed) return;
    setGuessCount(prev => prev + 1);
    if (fuzzyMatch(guess, pokemon.name)) {
      setRevealed(true);
      toast({
        title: "Correct! 🎉",
        description: `It's ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}! Guesses: ${guessCount + 1}`
      });
      setFeedback(null);
    } else {
      // Generation feedback
      const guessLower = guess.toLowerCase();
      fetch(`https://pokeapi.co/api/v2/pokemon/${guessLower}`).then(res => res.json()).then(data => {
        const guessedGen = getGenerationFromId(data.id);
        if (guessedGen < pokemon.generation) {
          setFeedback(`❌ Wrong! Try a newer generation.`);
        } else if (guessedGen > pokemon.generation) {
          setFeedback(`❌ Wrong! Try an older generation.`);
        } else {
          setFeedback(`❌ Wrong! But you're in the right generation!`);
        }
      }).catch(() => {
        setFeedback("❌ Wrong! That's not a valid Pokémon name.");
      });
    }
  };
  const getGenerationFromId = (id: number): number => {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;
    return 9;
  };
  const handleNext = () => {
    generateQuestion();
  };
  const handleReset = () => {
    setGuessCount(0);
    generateQuestion();
  };

  const handleHint = () => {
    if (revealed) return;
    
    if (hintLevel === 0) {
      setHintLevel(1); // Show abilities
    } else if (hintLevel === 1) {
      setHintLevel(2); // Show types
    } else if (hintLevel === 2) {
      setShowLetterModal(true); // Ask to reveal letters
    } else {
      if (revealedLetters < pokemon!.name.length) {
        setRevealedLetters(prev => prev + 1);
      }
    }
  };

  const confirmLetterReveal = () => {
    setShowLetterModal(false);
    setHintLevel(3);
    setRevealedLetters(1);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: "bg-gray-400",
      fire: "bg-orange-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-cyan-400",
      fighting: "bg-red-600",
      poison: "bg-purple-500",
      ground: "bg-amber-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-lime-500",
      rock: "bg-stone-600",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-600",
      dark: "bg-gray-700",
      steel: "bg-slate-500",
      fairy: "bg-pink-400",
    };
    return colors[type.toLowerCase()] || "bg-gray-500";
  };
  const handleShowAnswer = () => {
    setRevealed(true);
    toast({
      title: "Answer Revealed",
      description: `It's ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}!`,
      variant: "destructive"
    });
  };
  if (loading || !pokemon) {
    return <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading Pokémon...</p>
        </motion.div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-[960px]">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
            Dex Scope
          </h1>
          <p className="text-sm text-muted-foreground">
            Guess the Pokémon based on their stats!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[300px_1fr] max-w-5xl gap-4">
          {/* Left Column - Filters & Counter */}
          <div className="space-y-4">
            {/* Filters */}
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Filters</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Select value={generation} onValueChange={setGeneration}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Generations</SelectItem>
                      <SelectItem value="1">Generation 1</SelectItem>
                      <SelectItem value="2">Generation 2</SelectItem>
                      <SelectItem value="3">Generation 3</SelectItem>
                      <SelectItem value="4">Generation 4</SelectItem>
                      <SelectItem value="5">Generation 5</SelectItem>
                      <SelectItem value="6">Generation 6</SelectItem>
                      <SelectItem value="7">Generation 7</SelectItem>
                      <SelectItem value="8">Generation 8</SelectItem>
                      <SelectItem value="9">Generation 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="strong" checked={strongOnly} onCheckedChange={checked => setStrongOnly(checked as boolean)} />
                  <label htmlFor="strong" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Strong Pokémon (BST 450+)
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Pokémon Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border"
            >
              <div className="relative w-full aspect-square rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                {revealed ? (
                  <motion.img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="w-full h-full object-contain p-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <div className="text-6xl">❓</div>
                )}
              </div>

              {/* Revealed Hints */}
              {hintLevel >= 1 && (
                <div className="mt-4 space-y-2">
                  {hintLevel >= 1 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ability:</p>
                      <p className="text-sm font-medium">{pokemon.abilities.join(", ")}</p>
                    </div>
                  )}
                  {hintLevel >= 2 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type:</p>
                      <div className="flex gap-2">
                        {pokemon.types.map((type) => (
                          <Badge
                            key={type}
                            className={`${getTypeColor(type)} text-white border-0`}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Guess Counter */}
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    Guesses: {guessCount}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </motion.div>

            {/* Next Button */}
            
          </div>

          {/* Right Column - Quiz Card */}
          <div className=" grid gap-4">
            <QuizCard 
              pokemon={pokemon} 
              onGuess={handleGuess} 
              showImage={revealed} 
              feedback={feedback} 
              onShowAnswer={handleShowAnswer}
              hintLevel={hintLevel}
              revealedLetters={revealedLetters}
              onHint={handleHint}
            />

            {revealed && <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }}>
                <Button size="lg" onClick={handleNext} className="w-full text-base px-6 bg-[#1CAD62] hover:bg-[#179855]">
                  Next Question →
                </Button>
              </motion.div>}
          </div>
        </div>

        {/* Letter Reveal Modal */}
        <Dialog open={showLetterModal} onOpenChange={setShowLetterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Revealing Letters?</DialogTitle>
              <DialogDescription>
                Do you want to start revealing the Pokémon's name letter by letter?
                Each hint will reveal one more letter.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLetterModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmLetterReveal}>
                Yes, Start Revealing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default Index;