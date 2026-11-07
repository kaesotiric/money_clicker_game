import fs from "fs";
import readline from "readline";

/**
 * Builds a Markov chain model using the provided training CSV
 * Saves the transition probabilities into model.json
 */
export default class TrainingModel {
    static SIZE = 10; // We have 10 possible states
    static ASCII_OFFSET = 97;

    #transitionCounts: number[][];
    #totalTransitions: number[];

    /**
     * Creates empty transition tables for states a through j
     */
    public constructor() {
        this.#transitionCounts = Array.from({ length: TrainingModel.SIZE },
            () => new Array(TrainingModel.SIZE).fill(0));
        this.#totalTransitions = new Array(TrainingModel.SIZE).fill(0);
    }
    /**
     * Converts a letter from a-j into an array index from 0-9
     *
     * @param letter The state letter being converted
     * @return The index that represents the letter
     */
    private letterToIndex(letter: string): number {
        return letter.charCodeAt(0) - TrainingModel.ASCII_OFFSET;
    }
    /**
     * Converts an array index from 0-9 back into a state letter from a-j
     *
     * @param index The index being converted
     * @return The letter that represents the index
     */
    private indexToLetter(index: number): string {
        return String.fromCharCode(TrainingModel.ASCII_OFFSET + index);
    }

    /**
     * Reads the training CSV and builds the Markov model
     *
     * Side effects: Reads the training file and creates model.json
     */
    public async train(): Promise<void> {
        // Opens training file as a stream
        const file = fs.createReadStream("src/training/training.csv");
        const lines = readline.createInterface({ input: file, crlfDelay: Infinity }); // Reads file one line at a time

        for await (const line of lines) { // Each line represents 1 sequence of purchases
            const row = line.trim().split(",");
            this.processRow(row);
        }

        const model = this.buildModel(); // Converts the transition counts into probabilities
        this.saveModel(model); // Saves finish model
    }

    /**
     * Counts the transitions between consecutive states in one training row
     *
     * @param row One ordered sequence of states from the training data
     * Side effects: Updates the transition counts and totals
     */
    private processRow(row: string[]): void {
        for (let i = 0; i < row.length - 1; i++) {
            const from = row[i];
            const to = row[i + 1];

            if (!from || !to){
                continue; // If both states exist
            }

            // Converts state letters into indexes for the transition table
            const fromIndex = this.letterToIndex(from);
            const toIndex = this.letterToIndex(to);

            this.#transitionCounts[fromIndex][toIndex]++; // Incremenents transition from this state to next
            this.#totalTransitions[fromIndex]++; // Increments total transition leaving this sate
        }
    }
    /**
     * Converts the transition counts into probabilities
     *
     * @return The completed Markov transition model
     */
    private buildModel(): Record<string, Record<string, number>> {
        const model: Record<string, Record<string, number>> = {};

        // Go through every possible starting state
        for (let i = 0; i < TrainingModel.SIZE; i++) {
            if (this.#totalTransitions[i] === 0) continue;

            const fromLetter = this.indexToLetter(i);
            model[fromLetter] = {};
            // Will go through every possible next state
            for (let j = 0; j < TrainingModel.SIZE; j++) {
                const count = this.#transitionCounts[i][j];
                if (count === 0){
                    continue; // Ignore transitions that never happened in training data
                }

                const toLetter = this.indexToLetter(j);
                model[fromLetter][toLetter] = count / this.#totalTransitions[i]; // P = Num of transition / total transition from starting state
            }
        }
        return model;
    }

    /**
     * Saves the trained Markov model into a JSON file
     *
     * @param model The transition probability model being saved
     * Side effects: Creates or replaces model.json
     */
    private saveModel(model: Record<string, Record<string, number>>): void {
        fs.writeFileSync("src/training/model.json", JSON.stringify(model, null, 2));
        console.log("Model saved to model.json");
    }
}

new TrainingModel().train(); // Starts the actual training process