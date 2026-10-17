"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { featured } from "@/lib/content/solutions";

/**
 * Cutaway of a software stack. Interface, services and data are the Company
 * Management ERP. Intelligence is labeled as a studio discipline so it is
 * never read as an ERP module. The canvas is only a light wash; the words
 * stay in the DOM. If WebGL is unavailable, the CSS wash remains.
 */

const slabs = [
  { ...featured.layers[0], kind: "interface", mark: "ERP" },
  { ...featured.layers[1], kind: "api", mark: "ERP" },
  {
    code: "AI",
    term: "Intelligence",
    detail: "Assistants, agents, analytics",
    kind: "intelligence",
    mark: "Studio layer",
  },
  { ...featured.layers[2], kind: "data", mark: "ERP" },
] as const;

const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
const FRAG = `precision mediump float;uniform vec2 uRes;uniform float uTime;
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=uv-vec2(0.58,0.46);
  float d=length(p);
  float breathe=0.78+0.22*sin(uTime*0.45);
  float light=smoothstep(0.72,0.02,d)*breathe;
  float alpha=light*0.34;
  gl_FragColor=vec4(vec3(0.94,0.42,0.20)*alpha,alpha);
}`;

function Art({ kind }: { kind: (typeof slabs)[number]["kind"] }) {
  if (kind === "interface") {
    return (
      <div className="sf-art sf-art--ui" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }
  if (kind === "api") {
    return (
      <div className="sf-art sf-art--bus" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }
  if (kind === "intelligence") {
    return (
      <ol className="sf-art sf-art--loop" aria-hidden="true">
        <li>Observe</li>
        <li>Decide</li>
        <li>Act</li>
      </ol>
    );
  }
  return (
    <div className="sf-art sf-art--rows" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function FoundryStack() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) {
      canvas.hidden = true;
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, VERT);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      canvas.hidden = true;
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.hidden = true;
      gl.deleteProgram(program);
      return;
    }

    root.classList.add("is-webgl");
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let frame = 0;
    let visible = true;
    const started = performance.now();
    let disposed = false;
    let ticking = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      ticking = false;
      if (disposed) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, motion.matches ? 0 : (now - started) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!motion.matches && visible) {
        ticking = true;
        frame = window.requestAnimationFrame(draw);
      }
    };
    const start = () => {
      if (ticking || motion.matches || !visible) return;
      ticking = true;
      frame = window.requestAnimationFrame(draw);
    };

    const onMotionChange = () => {
      if (motion.matches) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        ticking = false;
        draw(performance.now());
      } else {
        start();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    observer.observe(root);
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (motion.matches) draw(performance.now());
    });
    resizeObserver.observe(canvas);
    motion.addEventListener("change", onMotionChange);
    resize();
    if (motion.matches) draw(performance.now());
    else start();

    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver.disconnect();
      motion.removeEventListener("change", onMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("is-webgl");
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <figure className="sf-foundry" data-foundry ref={rootRef}>
      <div className="sf-visual">
        <canvas ref={canvasRef} className="sf-wash" aria-hidden="true" />
        <div className="sf-stack">
          {slabs.map((slab, index) => (
            <article className="sf-slab" data-kind={slab.kind} key={slab.code} style={{ "--i": index } as CSSProperties}>
              <header>
                <span>{slab.code}</span>
                <em>{slab.mark}</em>
              </header>
              <p className="sf-slab-name">{slab.term}</p>
              <Art kind={slab.kind} />
              <p className="sf-slab-detail">{slab.detail}</p>
            </article>
          ))}
          <div className="sf-conduit" aria-hidden="true">
            <span className="sf-pulse" style={{ "--d": "0s" } as CSSProperties}>
              <i />
            </span>
            <span className="sf-pulse" style={{ "--d": "1.05s" } as CSSProperties}>
              <i />
            </span>
            <span className="sf-pulse" style={{ "--d": "2.1s" } as CSSProperties}>
              <i />
            </span>
          </div>
        </div>
      </div>
      <figcaption>
        <span>System diagram</span>
        <p>
          Interface, services and data describe the Company Management ERP in this repository.
          Intelligence is a TechM4Solutions discipline drawn in the same stack. It is not a module of that ERP.
        </p>
        <Link href={featured.cta.href}>
          {featured.cta.label}
          <span aria-hidden="true"> →</span>
        </Link>
      </figcaption>
    </figure>
  );
}
