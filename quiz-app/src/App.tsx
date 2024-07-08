import axios from 'axios';
import { useEffect, useState } from 'react';

interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

function App() {
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [allPossibleAnswers, setAllPossibleAnswers] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSelected, setIsSelected] = useState(false);

  async function combineAllAnswers(incorrectAnswers: TriviaQuestion[], correctAnswer: string) {
    let allAnswers: string[] = [];
    incorrectAnswers.forEach((item) => {
      item.incorrect_answers.forEach((incorrectAnswer) => {
        allAnswers.push(incorrectAnswer);
      });
    });
    allAnswers.push(correctAnswer);
    // Randomize order of answers in array
    allAnswers.sort(() => Math.random() - 0.5);
    setAllPossibleAnswers(allAnswers);
  }

  async function getTriviaData() {
    setLoading(true);
    const response = await axios.get('https://opentdb.com/api.php?amount=1');
    setTriviaQuestion(response.data.results);
    setCorrectAnswer(response.data.results[0].correct_answer);
    await combineAllAnswers(response.data.results, response.data.results[0].correct_answer);

    setLoading(false);
  }

  useEffect(() => {
    getTriviaData();
  }, []);

  function verifyAnswer(selectedAnswer: string) {
    setSelectedAnswer(selectedAnswer);
    if (selectedAnswer === correctAnswer) {
      setScore(score + 1);
    }
  }

  function handleNextQuestion() {
    // Only fetch a new question if not at the end
    if (questionNumber < 9) {
      setQuestionNumber(questionNumber + 1);
      getTriviaData();
      setSelectedAnswer('');
    } else {
      // If it's the last question, show the finish button
      setQuestionNumber(questionNumber + 1);
    }
  }

  function handleFinish() {
    setGameOver(true);
  }

  function removeCharacters(question: string) {
    return question
      .replace(/(&quot\;)/g, '"')
      .replace(/(&rsquo\;)/g, '"')
      .replace(/(&#039\;)/g, "'")
      .replace(/(&amp\;)/g, '"');
  }

  return (
    <div className="App bg-green-500 w-full h-[100vh] flex items-center">
      <div className="App-header bg-white w-[90%] sm:w-[500px] mx-auto h-fit rounded-sm px-5">
        <p className="text-xl font-bold pt-5 pb-2 border-b-2 border-gray-200">Quiz App</p>
        {loading ? (
          "Trivia Question Loading..."
        ) : (
          <p>Question: {questionNumber + 1}/10</p>
        )}

        {triviaQuestion.length > 0 && (
          <div className="py-2 text-center">
            {triviaQuestion.map((triviaData, index) => (
              <div key={index}>
                <div className="pb-3 text-left">{removeCharacters(triviaData.question)}</div>

                <div>
                  {allPossibleAnswers.map((answer, index) => (
                    <div key={index}>
                      <button
                        className={`border-2 w-full my-2 py-2 hover:border-blue-200 ${
                          selectedAnswer === answer
                            ? (answer === correctAnswer ? 'bg-green-200' : 'bg-red-200')
                            : ''
                        }`}
                        key={index}
                        disabled={selectedAnswer || gameOver}
                        onClick={() => verifyAnswer(answer)}
                      >
                        {removeCharacters(answer)}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Show "Next" button for all questions except the 10th */}
                {questionNumber < 9 && (
                  <button
                    className="w-full sm:w-[80%] my-2 rounded-md text-center py-2 bg-green-400"
                    onClick={handleNextQuestion} // Call handleNextQuestion
                  >
                    Next
                  </button>
                )}

                {/* Show "Finish" button only for the 10th question */}
                {questionNumber === 9 && (
                  <button
                    className="w-full sm:w-[80%] my-2 rounded-md text-center py-2 bg-green-400"
                    onClick={handleFinish}
                  >
                    Finish
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {gameOver && (
          <p className="text-center font-bold text-xl pb-4 text-red-600">Game Over. Final Score is: {score}</p>
        )}
      </div>
    </div>
  );
}

export default App;