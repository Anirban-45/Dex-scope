import React, { useState } from "react";
import { motion } from "framer-motion";
import { Pokemon } from "@/types/pokemon";
import StatBar from "./StatBar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Lightbulb, Eye } from "lucide-react";

interface QuizCardProps {
  pokemon: Pokemon;
  onGuess: (guess: string) => void;
  showImage: boolean;
  feedback: string | null;
  onShowAnswer: () => void;
  hintLevel: number;
  revealedLetters: number;
  onHint: () => void;
}

const QuizCard = ({
  pokemon,
  onGuess,
  showImage,
  feedback,
  onShowAnswer,
  hintLevel,
  revealedLetters,
  onHint,
}: QuizCardProps) => {
  const [guess, setGuess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onGuess(guess.trim());
      setGuess("");
    }
  };

  const getLetterHint = () => {
    if (hintLevel >= 3) {
      const displayName = pokemon.name
        .split("")
        .map((char, idx) => (idx < revealedLetters ? char : "_"))
        .join(" ");
      return `Name: ${displayName.toUpperCase()}`;
    }
    return null;
  };

  const letterHint = getLetterHint();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-card to-card/80 rounded-3xl p-6 shadow-[var(--shadow-card)] border border-border">
        {/* Stats Display */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground">Base Stats</h3>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Base Stat Total</p>
              <p className="text-2xl font-black text-primary">{pokemon.bst}</p>
            </div>
          </div>
          {pokemon.stats.map((stat, index) => (
            <StatBar
              key={stat.name}
              name={stat.name}
              value={stat.value}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Letter Hint Display */}
        {letterHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-secondary/20 text-center text-sm font-bold text-foreground"
          >
            💡 {letterHint}
          </motion.div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-accent/20 text-center text-sm font-medium text-foreground"
          >
            {feedback}
          </motion.div>
        )}

        {/* Guess Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter Pokémon name..."
            className="text-base"
            disabled={showImage}
          />
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="submit"
              size="lg"
              className="col-span-1 text-sm font-semibold bg-great-ball hover:bg-great-ball/90 text-great-ball-foreground"
              disabled={!guess.trim() || showImage}
            >
              Submit
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onHint}
              disabled={showImage || (hintLevel >= 3 && revealedLetters >= pokemon.name.length)}
              className="col-span-1 gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Hint
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={onShowAnswer}
              disabled={showImage}
              className="col-span-1 gap-2"
            >
              <Eye className="w-4 h-4" />
              Answer
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default QuizCard;
