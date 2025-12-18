export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export type BetType = 'STRAIGHT' | 'RED' | 'BLACK' | 'ODD' | 'EVEN' | 'LOW' | 'HIGH' | 'DOZEN_1' | 'DOZEN_2' | 'DOZEN_3' | 'COL_1' | 'COL_2' | 'COL_3';

export interface Bet {
  id: string;
  type: BetType;
  value: number | string; // The number bet on, or the category string
  amount: number;
}

export const getNumberColor = (num: number) => {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
};

export const calculateWinnings = (result: number, bets: Bet[]): number => {
  let winnings = 0;

  bets.forEach(bet => {
    let win = false;
    let multiplier = 0;

    switch (bet.type) {
      case 'STRAIGHT':
        win = result === Number(bet.value);
        multiplier = 35;
        break;
      case 'RED':
        win = RED_NUMBERS.includes(result);
        multiplier = 1;
        break;
      case 'BLACK':
        win = BLACK_NUMBERS.includes(result);
        multiplier = 1;
        break;
      case 'EVEN':
        win = result !== 0 && result % 2 === 0;
        multiplier = 1;
        break;
      case 'ODD':
        win = result !== 0 && result % 2 !== 0;
        multiplier = 1;
        break;
      case 'LOW':
        win = result >= 1 && result <= 18;
        multiplier = 1;
        break;
      case 'HIGH':
        win = result >= 19 && result <= 36;
        multiplier = 1;
        break;
      case 'DOZEN_1':
        win = result >= 1 && result <= 12;
        multiplier = 2;
        break;
      case 'DOZEN_2':
        win = result >= 13 && result <= 24;
        multiplier = 2;
        break;
      case 'DOZEN_3':
        win = result >= 25 && result <= 36;
        multiplier = 2;
        break;
      case 'COL_1':
        win = result > 0 && result % 3 === 1;
        multiplier = 2;
        break;
      case 'COL_2':
        win = result > 0 && result % 3 === 2;
        multiplier = 2;
        break;
      case 'COL_3':
        win = result > 0 && result % 3 === 0;
        multiplier = 2;
        break;
    }

    if (win) {
      winnings += bet.amount * (multiplier + 1); // Return original stake + winnings
    }
  });

  return winnings;
};