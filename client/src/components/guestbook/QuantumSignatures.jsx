import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGuestbook } from '../../hooks/useGuestbook';
import { useTokens } from '../../context/TokenContext';
import styles from './QuantumSignatures.module.scss';

const COLOR_PALETTE = [
  { name: 'Neon Cyan', hex: '#00ffcc' },
  { name: 'Neon Magenta', hex: '#ff00ff' },
  { name: 'Neon Yellow', hex: '#ffff00' },
  { name: 'Soft Purple', hex: '#7c3aed' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'White', hex: '#ffffff' },
];

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const THUMB_WIDTH = 100;
const THUMB_HEIGHT = 50;

function SignatureThumbnail({ signature }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !signature.strokes?.length) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

    const scaleX = THUMB_WIDTH / CANVAS_WIDTH;
    const scaleY = THUMB_HEIGHT / CANVAS_HEIGHT;

    ctx.strokeStyle = signature.color || '#00ffcc';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    signature.strokes.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * scaleX, stroke[0].y * scaleY);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x * scaleX, stroke[i].y * scaleY);
      }
      ctx.stroke();
    });
  }, [signature]);

  return (
    <motion.div
      className={styles.thumbnail}
      style={{ '--sig-color': signature.color || '#00ffcc' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        width={THUMB_WIDTH}
        height={THUMB_HEIGHT}
        className={styles.thumbCanvas}
      />
      <span className={styles.thumbName}>{signature.name}</span>
    </motion.div>
  );
}

function ParticleBurst({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.particleBurst}>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className={styles.particle}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.cos((i * 30 * Math.PI) / 180) * 60,
            y: Math.sin((i * 30 * Math.PI) / 180) * 60,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function QuantumSignatures() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);
  const [name, setName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { signatures, loading, error, apiAvailable, submitSignature } = useGuestbook();
  const { earnTokens } = useTokens();

  // Draw all strokes + current stroke on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const allStrokes = [...strokes, ...(currentStroke.length ? [currentStroke] : [])];
    allStrokes.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke, selectedColor]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const point = getCanvasPoint(e);
    setCurrentStroke([point]);
  }, [getCanvasPoint]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const point = getCanvasPoint(e);
    setCurrentStroke((prev) => [...prev, point]);
  }, [getCanvasPoint]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke([]);
  }, [currentStroke]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');
    if (!name.trim()) {
      setSubmitError('Please enter your name');
      return;
    }
    if (strokes.length === 0) {
      setSubmitError('Draw something on the canvas first');
      return;
    }

    await submitSignature({
      name: name.trim(),
      strokes,
      color: selectedColor,
    });

    earnTokens('LEAVE_SIGNATURE');
    setShowSuccess(true);
    setStrokes([]);
    setCurrentStroke([]);
    setName('');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [name, strokes, selectedColor, submitSignature, earnTokens]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Quantum Signatures
        </motion.h2>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Leave your quantum signature on the fabric of spacetime. Your mark persists across all universes.
        </motion.p>

        {/* Canvas */}
        <motion.div
          className={styles.canvasWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={styles.canvas}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />

          {/* Success Particle Burst */}
          <AnimatePresence>
            {showSuccess && (
              <ParticleBurst onComplete={() => setShowSuccess(false)} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Controls */}
        <motion.div
          className={styles.controls}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className={styles.colorPalette}>
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.hex}
                className={`${styles.colorSwatch} ${selectedColor === color.hex ? styles.activeSwatch : ''}`}
                style={{ '--swatch-color': color.hex }}
                onClick={() => setSelectedColor(color.hex)}
                aria-label={`Select ${color.name}`}
                title={color.name}
              />
            ))}
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.clearBtn} onClick={handleClear}>
              Clear
            </button>
          </div>
        </motion.div>

        {/* Name Input + Submit */}
        <motion.div
          className={styles.submitArea}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <input
            type="text"
            className={styles.nameInput}
            placeholder="Your name across the multiverse..."
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 50))}
            maxLength={50}
          />
          <button className={styles.submitBtn} onClick={handleSubmit}>
            Sign the Fabric
          </button>
        </motion.div>

        {/* Error / API Status */}
        <AnimatePresence>
          {submitError && (
            <motion.p
              className={styles.errorMsg}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {submitError}
            </motion.p>
          )}
        </AnimatePresence>

        {!apiAvailable && (
          <p className={styles.apiWarning}>
            Signatures will be saved when the server is connected
          </p>
        )}

        {/* Constellation of Past Signatures */}
        <motion.div
          className={styles.constellation}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className={styles.constellationTitle}>Constellation of Marks</h3>
          {loading ? (
            <p className={styles.loadingText}>Loading signatures from the multiverse...</p>
          ) : signatures.length === 0 ? (
            <p className={styles.emptyText}>Be the first to leave your mark across dimensions</p>
          ) : (
            <div className={styles.sigGrid}>
              {signatures.map((sig, i) => (
                <SignatureThumbnail key={sig._id || `sig-${i}`} signature={sig} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
