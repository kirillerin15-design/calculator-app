import {
  Application,
  Page,
  GridLayout,
  Label,
  Button,
  ItemSpec,
  Color,
} from '@nativescript/core';

// ===========================
// 1. КОНФИГУРАЦИЯ И СТИЛИ
// ===========================

const COLORS = {
  background: new Color('#000000'), // Черный фон
  text: new Color('#FFFFFF'), // Белый текст
  btnDigit: new Color('#333333'), // Темно-серые кнопки цифр
  btnFunc: new Color('#A5A5A5'), // Светло-серые (AC, +/-)
  btnOp: new Color('#FF9F0A'), // Оранжевые (+, -)
  btnTextDark: new Color('#000000'), // Текст для светлых кнопок
};

const STYLES = {
  page: {
    backgroundColor: COLORS.background,
  },
  display: {
    color: COLORS.text,
    fontSize: 64,
    textAlignment: 'right',
    verticalAlignment: 'bottom',
    marginRight: 20,
    marginBottom: 10,
    height: 150,
  },
  btnBase: {
    borderRadius: 50, // Круглые кнопки
    margin: 6,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  btnZero: {
    textAlignment: 'left',
    paddingLeft: 30,
    borderRadius: 40, // Для овальной кнопки 0
  },
};

// ===========================
// 2. ЛОГИКА КАЛЬКУЛЯТОРА
// ===========================

let state = {
  displayValue: '0',
  operand: null,
  operator: null,
  waitingForNewInput: false,
};

// Ссылка на UI элемент дисплея, чтобы обновлять текст
let displayLabel = null;

function updateDisplay() {
  if (displayLabel) {
    displayLabel.text = state.displayValue;
  }
}

// Ввод цифры
function inputDigit(digit) {
  const { displayValue, waitingForNewInput } = state;

  if (waitingForNewInput) {
    state.displayValue = String(digit);
    state.waitingForNewInput = false;
  } else {
    state.displayValue =
      displayValue === '0' ? String(digit) : displayValue + digit;
  }
  updateDisplay();
}

// Ввод точки
function inputDot() {
  const { displayValue, waitingForNewInput } = state;

  if (waitingForNewInput) {
    state.displayValue = '0.';
    state.waitingForNewInput = false;
  } else if (!displayValue.includes('.')) {
    state.displayValue = displayValue + '.';
  }
  updateDisplay();
}

// Очистка (AC)
function clearAll() {
  state = {
    displayValue: '0',
    operand: null,
    operator: null,
    waitingForNewInput: false,
  };
  updateDisplay();
}

// Смена знака (+/-)
function toggleSign() {
  state.displayValue = String(parseFloat(state.displayValue) * -1);
  updateDisplay();
}

// Процент (%)
function inputPercent() {
  const current = parseFloat(state.displayValue);
  state.displayValue = String(current / 100);
  updateDisplay();
}

// Обработка операторов (+, -, /, *)
function handleOperator(nextOperator) {
  const inputValue = parseFloat(state.displayValue);

  if (state.operand === null) {
    state.operand = inputValue;
  } else if (state.operator && !state.waitingForNewInput) {
    const currentValue = state.operand || 0;
    const result = performCalculation(state.operator, currentValue, inputValue);

    // Обрезаем длинные хвосты и убираем лишние нули
    let resultString = String(result);
    if (resultString.length > 10) {
      resultString = result.toPrecision(8).replace(/\.?0+$/, '');
    }

    state.displayValue = resultString;
    state.operand = result;
    updateDisplay();
  }

  state.waitingForNewInput = true;
  state.operator = nextOperator;
}

// Математика
function performCalculation(op, first, second) {
  switch (op) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '*':
      return first * second;
    case '/':
      return second === 0 ? 0 : first / second;
    default:
      return second;
  }
}

function handleEqual() {
  handleOperator(state.operator); // Вычисляем итог
  state.operator = null; // Сбрасываем оператор
  state.operand = null;
  state.waitingForNewInput = true; // Готовимся к новому числу
}

// ===========================
// 3. ПОСТРОЕНИЕ UI
// ===========================

function applyStyle(view, styleObj) {
  for (const key in styleObj) {
    view.style[key] = styleObj[key];
  }
}

function createCalculatorPage() {
  const page = new Page();
  page.actionBarHidden = true; // Скрываем верхнюю панель NativeScript
  applyStyle(page, STYLES.page);

  // Основная сетка: 2 строки. 0=Экран, 1=Кнопки
  const mainGrid = new GridLayout();
  mainGrid.addRow(new ItemSpec(1, 'auto')); // Верх под контент (дисплей)
  mainGrid.addRow(new ItemSpec(1, 'star')); // Низ растягивается (кнопки)
  page.content = mainGrid;

  // --- Дисплей ---
  displayLabel = new Label();
  displayLabel.text = '0';
  applyStyle(displayLabel, STYLES.display);
  GridLayout.setRow(displayLabel, 0);
  mainGrid.addChild(displayLabel);

  // --- Клавиатура ---
  const keypad = new GridLayout();
  GridLayout.setRow(keypad, 1);

  // Создаем сетку 5 строк x 4 колонки
  for (let r = 0; r < 5; r++) keypad.addRow(new ItemSpec(1, 'star'));
  for (let c = 0; c < 4; c++) keypad.addColumn(new ItemSpec(1, 'star'));

  // Данные кнопок
  const buttonsData = [
    {
      label: 'AC',
      r: 0,
      c: 0,
      color: COLORS.btnFunc,
      txtColor: COLORS.btnTextDark,
      tap: clearAll,
    },
    {
      label: '+/-',
      r: 0,
      c: 1,
      color: COLORS.btnFunc,
      txtColor: COLORS.btnTextDark,
      tap: toggleSign,
    },
    {
      label: '%',
      r: 0,
      c: 2,
      color: COLORS.btnFunc,
      txtColor: COLORS.btnTextDark,
      tap: inputPercent,
    },
    {
      label: '÷',
      r: 0,
      c: 3,
      color: COLORS.btnOp,
      tap: () => handleOperator('/'),
    },

    {
      label: '7',
      r: 1,
      c: 0,
      color: COLORS.btnDigit,
      tap: () => inputDigit('7'),
    },
    {
      label: '8',
      r: 1,
      c: 1,
      color: COLORS.btnDigit,
      tap: () => inputDigit('8'),
    },
    {
      label: '9',
      r: 1,
      c: 2,
      color: COLORS.btnDigit,
      tap: () => inputDigit('9'),
    },
    {
      label: '×',
      r: 1,
      c: 3,
      color: COLORS.btnOp,
      tap: () => handleOperator('*'),
    },

    {
      label: '4',
      r: 2,
      c: 0,
      color: COLORS.btnDigit,
      tap: () => inputDigit('4'),
    },
    {
      label: '5',
      r: 2,
      c: 1,
      color: COLORS.btnDigit,
      tap: () => inputDigit('5'),
    },
    {
      label: '6',
      r: 2,
      c: 2,
      color: COLORS.btnDigit,
      tap: () => inputDigit('6'),
    },
    {
      label: '−',
      r: 2,
      c: 3,
      color: COLORS.btnOp,
      tap: () => handleOperator('-'),
    },

    {
      label: '1',
      r: 3,
      c: 0,
      color: COLORS.btnDigit,
      tap: () => inputDigit('1'),
    },
    {
      label: '2',
      r: 3,
      c: 1,
      color: COLORS.btnDigit,
      tap: () => inputDigit('2'),
    },
    {
      label: '3',
      r: 3,
      c: 2,
      color: COLORS.btnDigit,
      tap: () => inputDigit('3'),
    },
    {
      label: '+',
      r: 3,
      c: 3,
      color: COLORS.btnOp,
      tap: () => handleOperator('+'),
    },

    // 0 занимает две колонки (colSpan: 2)
    {
      label: '0',
      r: 4,
      c: 0,
      cs: 2,
      color: COLORS.btnDigit,
      tap: () => inputDigit('0'),
    },
    { label: '.', r: 4, c: 2, color: COLORS.btnDigit, tap: inputDot },
    { label: '=', r: 4, c: 3, color: COLORS.btnOp, tap: handleEqual },
  ];

  // Генерация кнопок
  buttonsData.forEach((btnInfo) => {
    const btn = new Button();
    btn.text = btnInfo.label;

    // Позиция
    GridLayout.setRow(btn, btnInfo.r);
    GridLayout.setColumn(btn, btnInfo.c);
    if (btnInfo.cs) GridLayout.setColumnSpan(btn, btnInfo.cs);

    // Стиль
    applyStyle(btn, STYLES.btnBase);
    btn.backgroundColor = btnInfo.color;

    // Особый цвет текста, если задан
    if (btnInfo.txtColor) btn.color = btnInfo.txtColor;
    // Особый стиль для кнопки Ноль
    if (btnInfo.label === '0') applyStyle(btn, STYLES.btnZero);

    // Обработка клика
    btn.on('tap', () => {
      // Эффект анимации можно добавить сюда
      if (btnInfo.tap) btnInfo.tap();
    });

    keypad.addChild(btn);
  });

  mainGrid.addChild(keypad);
  return page;
}

// ===========================
// 4. ЗАПУСК ПРИЛОЖЕНИЯ
// ===========================

// Используем параметр { create: ... }, чтобы не нужны были XML файлы
Application.run({ create: createCalculatorPage });
