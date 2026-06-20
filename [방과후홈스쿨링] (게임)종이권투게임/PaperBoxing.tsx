import React, { useState, useEffect } from 'react';

// --- 오디오 효과음 유틸리티 ---
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'clash') {
      // 둔탁한 소리에서 -> 경쾌한 '팝(Pop)' 소리로 변경
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now); // 높은 주파수에서 시작
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1); // 빠르게 떨어짐
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); // 매우 짧게 끊음
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'win') {
      // 승리 빰빰빰
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};

// --- 유틸리티 함수 ---
const getCurrentPos = (path) => {
  for (let i = path.length - 1; i >= 0; i--) {
    if (path[i] !== null) return path[i];
  }
  return 0; 
};

const getValidMoves = (path) => {
  const currentPos = getCurrentPos(path);
  if (currentPos === null) return []; 

  const r = Math.floor(currentPos / 4);
  const c = currentPos % 4;
  const valid = [];

  for (let i = r - 1; i <= r + 1; i++) {
    for (let j = c - 1; j <= c + 1; j++) {
      if (i >= 0 && i < 4 && j >= 0 && j < 4) {
        if (i === r && j === c) continue; 
        const idx = i * 4 + j;
        if (!path.includes(idx)) {
          valid.push(idx);
        }
      }
    }
  }
  return valid;
};

const getCenterCoord = (idx) => {
  const r = Math.floor(idx / 4);
  const c = idx % 4;
  return { x: `${(c * 25) + 12.5}%`, y: `${(r * 25) + 12.5}%` };
};

// --- 컴포넌트 1: 타이틀 화면 ---
const TitleScreen = ({ onNext }) => (
  <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    {/* 배경 데코레이션 */}
    <div className="absolute w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[150px] opacity-20 -top-20 -left-20 animate-pulse"></div>
    <div className="absolute w-[500px] h-[500px] bg-pink-500 rounded-full blur-[150px] opacity-20 bottom-0 -right-20"></div>

    <div className="relative z-10 text-center flex flex-col items-center">
      <div className="text-6xl mb-6 animate-bounce">🥊</div>
      <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4 tracking-tighter">
        종이 권투
      </h1>
      <h2 className="text-2xl md:text-3xl text-gray-400 font-bold mb-16 tracking-widest uppercase">
        Paper Boxing Game
      </h2>
      <button 
        onClick={() => { playSound('click'); onNext(); }}
        className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-2xl font-black rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-110 hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] transition-all duration-300"
      >
        시작하기
      </button>
    </div>
  </div>
);

// --- 컴포넌트 2: 튜토리얼 화면 ---
const TutorialScreen = ({ onNext }) => (
  <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 lg:p-8 relative">
    <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-3xl p-8 shadow-2xl relative z-10">
      <h2 className="text-4xl font-black text-white text-center mb-10 border-b border-gray-700 pb-6">
        📖 게임 규칙 안내
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">🔢</div>
          <h3 className="text-xl font-bold text-cyan-400 mb-2">1. 비밀 배치</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            각자 모눈종이에 <strong className="text-white">1부터 15까지의 숫자</strong>를 보이지 않게 무작위로 배치합니다. 좌측 상단은 출발 칸입니다.
          </p>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">↗️</div>
          <h3 className="text-xl font-bold text-pink-400 mb-2">2. 이동과 배틀</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            번갈아가며 <strong className="text-white">가로, 세로, 대각선 이웃 칸</strong>으로 한 칸씩 이동합니다. 동시에 선택한 칸의 숫자를 비교해 <strong className="text-yellow-400">큰 숫자가 승점</strong>을 얻습니다!
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">3. 재방문 불가</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-white">한 번 지나간 칸은 다시 갈 수 없습니다.</strong> 경로를 미리 계획하세요!
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">💀</div>
          <h3 className="text-xl font-bold text-purple-400 mb-2">4. 고립 주의</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            더 이상 이동할 칸이 없어 고립되면, 그 라운드부터는 <strong className="text-red-500">강제로 0점이 제출</strong>되어 무조건 패배합니다.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => { playSound('click'); onNext(); }}
          className="px-12 py-4 bg-white text-gray-900 text-xl font-black rounded-full hover:bg-gray-200 transition-colors shadow-lg"
        >
          규칙을 이해했습니다!
        </button>
      </div>
    </div>
  </div>
);

// --- 컴포넌트 3: 초기 진영 설정 보드 ---
const SetupBoard = ({ player, onComplete }) => {
  const [placedOrder, setPlacedOrder] = useState([]);

  const handleCellClick = (idx) => {
    if (idx === 0) return;
    if (placedOrder.length >= 15) return;
    if (!placedOrder.includes(idx)) {
      playSound('click');
      setPlacedOrder([...placedOrder, idx]);
    }
  };

  const handleUndo = () => {
    if (placedOrder.length > 0) playSound('click');
    setPlacedOrder(prev => prev.slice(0, -1));
  };

  const handleComplete = () => {
    if (placedOrder.length === 15) {
      playSound('win');
      const finalGrid = Array(16).fill(null);
      finalGrid[0] = 0;
      placedOrder.forEach((pos, idx) => {
        finalGrid[pos] = idx + 1;
      });
      onComplete(finalGrid);
    }
  };

  const isA = player === 'A';
  const colorClass = isA ? 'text-cyan-400' : 'text-pink-400';
  const activeBg = isA ? 'bg-cyan-500' : 'bg-pink-500';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white relative">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className={`text-3xl font-black mb-2 ${colorClass}`}>
            플레이어 {player} 진영 설정
          </h2>
          <p className="text-gray-400 text-sm">
            상대방이 보지 못하게 가리고 1부터 15까지 배치하세요.<br/>
            (현재 <strong className="text-white">{placedOrder.length}</strong> / 15 칸 완료)
          </p>
          {/* 진행률 바 */}
          <div className="w-full h-2 bg-gray-800 rounded-full mt-4 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${activeBg}`} style={{ width: `${(placedOrder.length / 15) * 100}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-4 grid-rows-4 w-full aspect-square border border-gray-700 bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {Array.from({ length: 16 }).map((_, idx) => {
            const isStart = idx === 0;
            const orderIdx = placedOrder.indexOf(idx);
            const isPlaced = orderIdx !== -1;

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`border border-gray-700 flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-200
                  ${isStart ? 'bg-yellow-500 text-gray-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]' : ''}
                  ${!isStart && !isPlaced ? 'bg-gray-900 hover:bg-gray-700 text-transparent' : ''}
                  ${isPlaced ? `${isA ? 'bg-cyan-900/40 text-cyan-300' : 'bg-pink-900/40 text-pink-300'} shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]` : ''}
                `}
              >
                {isStart ? '출발' : (isPlaced ? orderIdx + 1 : '')}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-8 gap-4">
          <button
            onClick={handleUndo}
            disabled={placedOrder.length === 0}
            className="flex-1 py-4 bg-gray-800 text-gray-300 font-bold rounded-xl disabled:opacity-30 hover:bg-gray-700 transition"
          >
            되돌리기
          </button>
          <button
            onClick={handleComplete}
            disabled={placedOrder.length < 15}
            className={`flex-1 py-4 font-black text-white rounded-xl transition disabled:opacity-30 shadow-lg
              ${isA ? 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-pink-600 hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]'}
            `}
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 컴포넌트 4: 메인 게임 ---
export default function App() {
  const [gameState, setGameState] = useState('TITLE'); 
  // 'TITLE' -> 'TUTORIAL' -> 'SETUP_A' -> 'SETUP_B' -> 'READY' -> 'PLAYING' -> 'GAME_OVER'
  
  const [gridA, setGridA] = useState(null);
  const [gridB, setGridB] = useState(null);

  const [pathA, setPathA] = useState([0]);
  const [pathB, setPathB] = useState([0]);

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [round, setRound] = useState(1);

  const [turnPhase, setTurnPhase] = useState('SELECT_A');
  const [selectionA, setSelectionA] = useState(null);
  const [selectionB, setSelectionB] = useState(null);

  const [popupMsg, setPopupMsg] = useState(null);

  const resetGame = () => {
    setGameState('TITLE');
    setGridA(null); setGridB(null);
    setPathA([0]); setPathB([0]);
    setScoreA(0); setScoreB(0);
    setRound(1);
    setTurnPhase('SELECT_A');
    setSelectionA(null); setSelectionB(null);
    setPopupMsg(null);
  };

  const handleReveal = () => {
    playSound('clash');
    const valA = selectionA === 'CANT_MOVE' ? 0 : gridA[selectionA];
    const valB = selectionB === 'CANT_MOVE' ? 0 : gridB[selectionB];

    let winnerStr = "무승부!";
    let isAWon = false;
    let isBWon = false;

    if (valA > valB) {
      winnerStr = "플레이어 A (청) 승리!";
      isAWon = true;
      playSound('win');
    } else if (valB > valA) {
      winnerStr = "플레이어 B (홍) 승리!";
      isBWon = true;
      playSound('win');
    }

    setPathA(prev => [...prev, selectionA === 'CANT_MOVE' ? null : selectionA]);
    setPathB(prev => [...prev, selectionB === 'CANT_MOVE' ? null : selectionB]);

    setPopupMsg({ title: winnerStr, valA, valB, isAWon, isBWon });
  };

  const handleNextRound = () => {
    playSound('click');
    if (popupMsg.isAWon) setScoreA(s => s + 1);
    if (popupMsg.isBWon) setScoreB(s => s + 1);

    setPopupMsg(null);
    setSelectionA(null);
    setSelectionB(null);

    if (round === 15) {
      setGameState('GAME_OVER');
      playSound('win');
    } else {
      setRound(r => r + 1);
      setTurnPhase('SELECT_A');
    }
  };

  const renderGameBoard = (player, grid, path) => {
    const isPlayerA = player === 'A';
    const isCurrentTurn = (isPlayerA && turnPhase === 'SELECT_A') || (!isPlayerA && turnPhase === 'SELECT_B');
    const validMoves = getValidMoves(path);
    const currentPos = getCurrentPos(path);
    const hasLost = path[path.length - 1] === null;

    const strokeColor = isPlayerA ? '#22D3EE' : '#F472B6'; // Cyan-400, Pink-400
    const themeColorText = isPlayerA ? 'text-cyan-400' : 'text-pink-400';
    const themeColorBg = isPlayerA ? 'bg-cyan-900/10' : 'bg-pink-900/10';

    return (
      <div className="flex flex-col items-center flex-1 w-full max-w-[340px]">
        <h3 className={`text-2xl font-black mb-4 flex items-center justify-between w-full px-4 ${themeColorText}`}>
          <span>Player {player}</span>
          <span className="text-white bg-gray-800 px-4 py-1 rounded-full text-lg shadow-inner">
            승점: {isPlayerA ? scoreA : scoreB}
          </span>
        </h3>

        <div className={`relative w-full aspect-square border border-gray-700 rounded-xl overflow-hidden grid grid-cols-4 grid-rows-4 ${themeColorBg} shadow-2xl`}>
          
          {/* 격자 셀 */}
          {grid.map((num, idx) => {
            const isStart = idx === 0;
            const isVisited = path.includes(idx);
            const isCurrent = idx === currentPos && !hasLost;
            const isValidMove = isCurrentTurn && validMoves.includes(idx);

            let cellStyle = "border border-gray-700 bg-gray-800/80 text-white";
            if (isStart) cellStyle = "border border-gray-700 bg-yellow-500 text-gray-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]";
            else if (isVisited) cellStyle = `border border-gray-700 ${isPlayerA ? 'bg-cyan-900/30' : 'bg-pink-900/30'} text-gray-600`;
            
            if (isCurrent) {
              cellStyle = `border-2 z-20 ${isPlayerA ? 'border-cyan-400 bg-cyan-900/60' : 'border-pink-400 bg-pink-900/60'} shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]`;
            }

            if (isValidMove) {
              cellStyle = "border-2 border-green-400 bg-green-900/40 text-green-300 cursor-pointer hover:bg-green-800 hover:scale-105 z-20 transition-transform shadow-[0_0_15px_rgba(74,222,128,0.3)]";
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isValidMove) {
                    playSound('click');
                    if (isPlayerA) { setSelectionA(idx); setTurnPhase('SELECT_B'); } 
                    else { setSelectionB(idx); setTurnPhase('REVEAL'); }
                  }
                }}
                className={`flex items-center justify-center text-2xl font-bold ${cellStyle}`}
              >
                {isStart ? '출발' : num}
              </div>
            );
          })}

          {/* SVG 경로 오버레이 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {path.map((p, i) => {
              if (i === 0) return null;
              const p1 = path[i - 1];
              const p2 = p;
              if (p1 === null || p2 === null) return null;

              const coord1 = getCenterCoord(p1);
              const coord2 = getCenterCoord(p2);
              return (
                <line
                  key={`line-${i}`}
                  x1={coord1.x} y1={coord1.y}
                  x2={coord2.x} y2={coord2.y}
                  stroke={strokeColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeOpacity="0.8"
                  style={{ filter: `drop-shadow(0px 0px 5px ${strokeColor})` }}
                />
              );
            })}
            
            {path.map((p, i) => {
              if (p === null) return null;
              const coord = getCenterCoord(p);
              return (
                <circle
                  key={`dot-${i}`}
                  cx={coord.x}
                  cy={coord.y}
                  r="5"
                  fill="#fff"
                  stroke={strokeColor}
                  strokeWidth="3"
                  style={{ filter: `drop-shadow(0px 0px 4px ${strokeColor})` }}
                />
              );
            })}
          </svg>
        </div>

        {/* 하단 메세지 보드 */}
        <div className="mt-6 h-14 w-full flex items-center justify-center">
          {isCurrentTurn ? (
            validMoves.length > 0 ? (
               <div className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-400 rounded-full font-bold animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                 이동할 칸을 선택하세요!
               </div>
            ) : (
              <button
                onClick={() => {
                  playSound('click');
                  if (isPlayerA) { setSelectionA('CANT_MOVE'); setTurnPhase('SELECT_B'); } 
                  else { setSelectionB('CANT_MOVE'); setTurnPhase('REVEAL'); }
                }}
                className="px-6 py-3 bg-red-900 border border-red-500 text-red-300 rounded-xl font-bold hover:bg-red-800 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-bounce"
              >
                고립! 이동불가 (0점 제출)
              </button>
            )
          ) : (
             <div className="text-gray-600 font-bold tracking-widest text-sm uppercase">대기중...</div>
          )}
        </div>
      </div>
    );
  };

  // --- 화면 라우팅 ---
  if (gameState === 'TITLE') return <TitleScreen onNext={() => setGameState('TUTORIAL')} />;
  if (gameState === 'TUTORIAL') return <TutorialScreen onNext={() => setGameState('SETUP_A')} />;
  if (gameState === 'SETUP_A') return <SetupBoard key="setupA" player="A" onComplete={(g) => { setGridA(g); setGameState('SETUP_B'); }} />;
  if (gameState === 'SETUP_B') return <SetupBoard key="setupB" player="B" onComplete={(g) => { setGridB(g); setGameState('READY'); }} />;
  
  if (gameState === 'READY') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            READY!
          </h1>
          <p className="text-xl text-gray-400 mb-12 font-medium">모든 준비가 끝났습니다. 치열한 두뇌싸움을 시작하세요.</p>
          <button 
            onClick={() => { playSound('win'); setGameState('PLAYING'); }}
            className="px-16 py-6 text-2xl bg-white text-black font-black rounded-full shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform duration-300"
          >
            게임 시작 🔥
          </button>
        </div>
      </div>
    );
  }

  // PLAYING & GAME_OVER 라우팅
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 lg:p-8 text-white relative">
      
      {/* 상단 라운드 정보 */}
      <div className="w-full max-w-5xl bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-10 flex justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 to-pink-500"></div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight ml-4">
          {gameState === 'GAME_OVER' ? '게임 종료' : `ROUND ${round}`}
        </h1>
        <div className="text-lg md:text-xl font-bold bg-gray-900 px-6 py-2 rounded-xl text-gray-400 border border-gray-700">
          남은 라운드: <span className="text-white">{15 - round + (gameState === 'GAME_OVER' ? 1 : 0)}</span>
        </div>
      </div>

      {/* 게임 보드 영역 */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 justify-center mb-24">
        {renderGameBoard('A', gridA, pathA)}
        {/* 중앙 VS 장식 */}
        <div className="hidden md:flex items-center justify-center font-black text-5xl text-gray-700 italic">VS</div>
        {renderGameBoard('B', gridB, pathB)}
      </div>

      {/* 중앙 액션 버튼 (결과 확인) */}
      {turnPhase === 'REVEAL' && gameState === 'PLAYING' && !popupMsg && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={handleReveal}
            className="px-12 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 text-3xl font-black rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-110 transition-transform border-4 border-gray-900"
          >
            승부 확인! ⚡
          </button>
        </div>
      )}

      {/* 라운드 결과 팝업 */}
      {popupMsg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl transform scale-100 animate-[pulse_0.2s_ease-out]">
            <h2 className="text-3xl font-black text-white mb-10 tracking-tight">{popupMsg.title}</h2>
            
            <div className="flex justify-center items-center gap-8 mb-10">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-cyan-500 mb-2">Player A</span>
                <div className="w-20 h-20 bg-gray-900 border-2 border-cyan-500 rounded-2xl flex items-center justify-center text-4xl font-black text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  {popupMsg.valA}
                </div>
              </div>
              <div className="text-3xl font-black text-gray-600 italic">VS</div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-pink-500 mb-2">Player B</span>
                <div className="w-20 h-20 bg-gray-900 border-2 border-pink-500 rounded-2xl flex items-center justify-center text-4xl font-black text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  {popupMsg.valB}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextRound}
              className="w-full py-4 bg-white text-black text-xl font-black rounded-xl hover:bg-gray-200 transition shadow-lg"
            >
              다음 라운드
            </button>
          </div>
        </div>
      )}

      {/* 최종 결과 팝업 */}
      {gameState === 'GAME_OVER' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-500 rounded-full blur-[80px] opacity-30"></div>
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">최종 결과</h2>
            
            <div className="flex justify-center items-center gap-6 text-3xl font-black text-gray-400 mb-8">
              <span className="text-cyan-400">{scoreA}</span>
              <span>:</span>
              <span className="text-pink-400">{scoreB}</span>
            </div>
            
            <div className="text-2xl font-bold mb-12 text-yellow-400 p-6 bg-gray-900 rounded-2xl border border-gray-700 shadow-inner">
              {scoreA > scoreB ? "🎉 Player A 최종 승리!" : scoreB > scoreA ? "🎉 Player B 최종 승리!" : "🤝 명승부! 무승부!"}
            </div>

            <button
              onClick={() => { playSound('click'); resetGame(); }}
              className="w-full py-5 bg-gradient-to-r from-gray-700 to-gray-600 text-white text-xl font-black rounded-xl hover:from-gray-600 hover:to-gray-500 transition shadow-lg border border-gray-500"
            >
              처음부터 다시하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}