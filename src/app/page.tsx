'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HelpButton } from '@/components/HelpButton';

interface DigitDisplay {
  value: string;
  isReal: boolean;
}

interface SegmentDisplay {
  digits: DigitDisplay[];
  realLength: number;
}

export default function Home() {
  const { t } = useTranslation();
  const [randomNumber, setRandomNumber] = useState<string | null>(null);
  const [displayedParts, setDisplayedParts] = useState<SegmentDisplay[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [digits, setDigits] = useState<string>('6');
  const [showModal, setShowModal] = useState(false);
  const [segments, setSegments] = useState<string[]>([]);
  const [showingCompleted, setShowingCompleted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭模态框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (randomNumber) {
          console.log('Password closed by clicking outside:', {
            password: randomNumber,
            displayedSegments: displayedParts.length,
            totalSegments: segments.length,
            timestamp: new Date().toISOString(),
          });
        }
        setShowModal(false);
        setCurrentPartIndex(0);
        setDisplayedParts([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [randomNumber, displayedParts.length, segments.length]);

  useEffect(() => {
    console.log('Current state:', {
      randomNumber,
      segments,
      currentPartIndex,
      displayedParts: displayedParts.length,
      showingCompleted,
      showAll
    });
  }, [randomNumber, segments, currentPartIndex, displayedParts, showingCompleted, showAll]);

  const generateComplexNumber = (length: number): string => {
    const numbers = '0123456789';
    let result = '';
    let lastNum = '-1';
    let secondLastNum = '-2';
    
    result += numbers[Math.floor(Math.random() * 9) + 1];
    lastNum = result[0];
    
    for (let i = 1; i < length; i++) {
      let nextNum;
      let attempts = 0;
      const maxAttempts = 20;
      
      do {
        nextNum = numbers[Math.floor(Math.random() * 10)];
        attempts++;
        
        if (attempts >= maxAttempts) {
          if (nextNum !== lastNum) {
            break;
          }
        }
        
        const isRepeated = nextNum === lastNum;
        
        const isSequential = (
          (Number(nextNum) === Number(lastNum) + 1 && Number(lastNum) === Number(secondLastNum) + 1) ||
          (Number(nextNum) === Number(lastNum) - 1 && Number(lastNum) === Number(secondLastNum) - 1)
        );
        
        if (!isRepeated && !isSequential) {
          break;
        }
      } while (true);
      
      result += nextNum;
      secondLastNum = lastNum;
      lastNum = nextNum;
    }
    
    return result;
  };

  const generateRandomSegments = (number: string): string[] => {
    const targetGroups = Math.max(2, Math.floor(number.length / 3) + 1);
    const minSize = 2;
    const maxSize = 4; // 每组最多4个实际数字，加上4个干扰数字凑成8位
    
    const segments: string[] = [];
    let remainingDigits = number;
    
    // 如果数字太多，进行截断
    const maxDigits = targetGroups * maxSize;
    if (number.length > maxDigits) {
      remainingDigits = number.slice(0, maxDigits);
    }

    // 为前面的组分配2-4个数字
    for (let i = 0; i < targetGroups - 1 && remainingDigits.length > 0; i++) {
      // 确保剩余的数字足够分配给后面的组
      const remainingGroups = targetGroups - i - 1;
      const maxAllowed = Math.min(
        maxSize,
        remainingDigits.length - (remainingGroups * minSize)
      );
      
      if (maxAllowed < minSize) {
        // 如果剩余空间不足，将所有数字放入当前组
        segments.push(remainingDigits);
        return segments;
      }

      const size = Math.floor(Math.random() * (maxAllowed - minSize + 1)) + minSize;
      segments.push(remainingDigits.slice(0, size));
      remainingDigits = remainingDigits.slice(size);
    }

    // 添加最后一组
    if (remainingDigits.length > 0) {
      segments.push(remainingDigits);
    }

    return segments;
  };

  const generateNoiseDigits = (length: number, realDigits: string): string => {
    const numbers = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      let noiseDigit;
      do {
        noiseDigit = numbers[Math.floor(Math.random() * 10)];
      } while (realDigits.includes(noiseDigit));
      result += noiseDigit;
    }
    return result;
  };

  const createSegmentWithNoise = (segment: string): SegmentDisplay => {
    // 计算需要添加的干扰数字数量，使总长度为8
    const noiseCount = 8 - segment.length;
    
    // 生成干扰数字
    const noiseDigits = generateNoiseDigits(noiseCount, segment);
    
    // 创建结果数组，先放入真实数字
    const allDigits: DigitDisplay[] = segment.split('').map(d => ({ value: d, isReal: true }));
    
    // 随机插入干扰数字
    noiseDigits.split('').forEach(noise => {
      const insertPosition = Math.floor(Math.random() * (allDigits.length + 1));
      allDigits.splice(insertPosition, 0, { value: noise, isReal: false });
    });
    
    return {
      digits: allDigits,
      realLength: segment.length
    };
  };

  const generateNumber = () => {
    if (!digits || parseInt(digits) < 6) {
      setDigits('6');
      return;
    }

    const num = generateComplexNumber(parseInt(digits));
    setRandomNumber(num);
    const newSegments = generateRandomSegments(num);
    setSegments(newSegments);
    setDisplayedParts([]);
    setCurrentPartIndex(0);
    setShowingCompleted(false);
    setShowAll(false);
    setShowModal(true);
  };

  const resetDisplay = () => {
    setDisplayedParts([]);
    setCurrentPartIndex(0);
    setShowingCompleted(false);
    setShowAll(false);
    // 重新生成分组，但使用相同的随机数
    if (randomNumber) {
      setSegments(generateRandomSegments(randomNumber));
    }
  };

  const showNextPart = () => {
    if (currentPartIndex >= segments.length) return;
    
    console.log('Showing next part:', {
      currentPartIndex,
      segmentsLength: segments.length,
      displayedPartsLength: displayedParts.length
    });
    
    // 每次只显示当前组
    const currentSegment = segments[currentPartIndex];
    setDisplayedParts([createSegmentWithNoise(currentSegment)]);
    
    setCurrentPartIndex(prev => prev + 1);
    if (currentPartIndex === segments.length - 1) {
      setShowingCompleted(true);
    }
  };

  const showAllSegments = () => {
    if (!randomNumber) return;
    
    // 重新生成分组
    const newSegments = generateRandomSegments(randomNumber);
    setSegments(newSegments);
    
    // 为每个分组生成带干扰数字的显示
    const allParts = newSegments.map(segment => createSegmentWithNoise(segment));
    setDisplayedParts(allParts); // 显示所有分组
    setCurrentPartIndex(newSegments.length);
    setShowingCompleted(true);
    setShowAll(true);
  };

  const copyToClipboard = async () => {
    if (randomNumber) {
      try {
        await navigator.clipboard.writeText(randomNumber);
        alert('已复制到剪贴板！');
      } catch (err) {
        alert('复制失败，请手动复制');
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-pink-500">
      <LanguageSwitcher />
      <HelpButton />
      
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 font-sans tracking-tight">
          {t('title')}
        </h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="digits" className="block text-base font-medium text-gray-700 font-sans mb-2">
              {t('digits').label}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="digits"
                value={digits}
                onFocus={() => setDigits('')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value === '') {
                    setDigits('');
                    return;
                  }
                  const numValue = parseInt(value);
                  if (numValue > 32) {
                    setDigits('32');
                  } else {
                    setDigits(value);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseInt(value) < 6) {
                    setDigits('6');
                  }
                }}
                className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-sans text-lg transition-colors outline-none"
                placeholder={t('digits').placeholder}
              />
              <div className="mt-2 text-sm text-gray-500 font-sans">
                {t('digits').description}
              </div>
            </div>
          </div>

          <button
            onClick={generateNumber}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-sans text-lg font-medium rounded-lg shadow-md transition duration-200 tracking-wide"
          >
            {t('generateButton')}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 max-w-md w-full transform transition-all shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 font-sans tracking-tight mb-4">
              {t('memoryTraining').title}
            </h2>
            
            <div 
              onClick={!showAll ? showNextPart : undefined}
              className={`bg-gray-50 p-6 rounded-lg ${!showAll ? 'cursor-pointer hover:bg-gray-100' : ''} transition-colors`}
            >
              <div className="text-2xl font-mono tracking-wider text-center select-none">
                {displayedParts.map((part, index) => (
                  <div key={index} className="flex flex-row justify-center gap-2 mb-6">
                    {part.digits.map((digit, dIndex) => (
                      <span
                        key={dIndex}
                        className={`inline-block w-12 h-12 rounded-lg ${
                          digit.isReal 
                            ? 'bg-purple-100 text-purple-600' 
                            : 'bg-gray-100 text-gray-400'
                        } flex items-center justify-center text-2xl font-bold`}
                      >
                        {digit.value}
                      </span>
                    ))}
                  </div>
                ))}
                {currentPartIndex < segments.length && !showAll && (
                  <div className="text-gray-400 mt-6 text-base font-sans">
                    {currentPartIndex === 0 ? t('memoryTraining').clickToStart : t('memoryTraining').clickToShowNext}
                  </div>
                )}
                {showingCompleted && (
                  <div className="mt-6 space-y-4">
                    <div className="text-gray-400 text-base font-sans">
                      {t('memoryTraining').completed}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetDisplay();
                        }}
                        className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-sans text-base font-medium tracking-wide"
                      >
                        {t('memoryTraining').showAgain}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showAllSegments();
                        }}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-sans text-base font-medium tracking-wide"
                      >
                        {t('memoryTraining').setComplete}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-500 space-y-2 font-sans">
              <p>
                {t('memoryTraining').progress.replace('{current}', String(currentPartIndex)).replace('{total}', String(segments.length))}
              </p>
              <p>{t('memoryTraining').colorGuide}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (randomNumber) {
                    console.log('Password closed by button click:', {
                      password: randomNumber,
                      displayedSegments: displayedParts.length,
                      totalSegments: segments.length,
                      timestamp: new Date().toISOString(),
                    });
                  }
                  setShowModal(false);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-sans font-medium rounded-lg transition duration-200"
              >
                {t('memoryTraining').close}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
