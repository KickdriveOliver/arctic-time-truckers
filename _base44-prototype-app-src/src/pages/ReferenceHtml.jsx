import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ReferenceHtml() {
  const code = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pringles' Arctic Trucking (Raw Fish Edition)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="bg-amber-50 text-amber-900 min-h-screen">
    <div id="app" class="flex flex-col md:flex-row min-h-screen"></div>

    <script>
        // --- DATA STORE (The Brains) ---
        const translations = {
            en: { title: "Dispatch Center", timer: "Time on Road", start: "Hit the Road", pause: "Catnap Break", welcome: "Welcome, Trucker!" },
            de: { title: "Einsatzleitung", timer: "Zeit auf der Straße", start: "Losfahren", pause: "Nickerchen", welcome: "Willkommen, Trucker!" },
            fi: { title: "Lähetysasema", timer: "Aika Tiellä", start: "Lähde Reissuun", pause: "Nokoset", welcome: "Tervetuloa, Rekkakuski!" }
        };

        const state = {
            lang: localStorage.getItem('pringles_lang') || 'en',
            view: window.location.hash.slice(1) || 'dashboard',
            timer: {
                running: false,
                startTime: null,
                elapsed: parseInt(localStorage.getItem('pringles_elapsed') || '0')
            }
        };

        // --- CORE FUNCTIONS ---
        function getText(key) {
            return translations[state.lang][key] || key;
        }

        function setLang(lang) {
            state.lang = lang;
            localStorage.setItem('pringles_lang', lang);
            render();
        }

        function navigate(view) {
            window.location.hash = view;
            // State updates in hashchange listener
        }

        function formatTime(ms) {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)));
            return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }

        // --- TIMER LOGIC ---
        let timerInterval;

        function toggleTimer() {
            state.timer.running = !state.timer.running;
            
            if (state.timer.running) {
                state.timer.startTime = Date.now() - state.timer.elapsed;
                timerInterval = setInterval(() => {
                    state.timer.elapsed = Date.now() - state.timer.startTime;
                    localStorage.setItem('pringles_elapsed', state.timer.elapsed);
                    document.getElementById('timer-display').innerText = formatTime(state.timer.elapsed);
                }, 1000);
            } else {
                clearInterval(timerInterval);
                localStorage.setItem('pringles_elapsed', state.timer.elapsed);
            }
            render();
        }

        // --- COMPONENTS (The Fur) ---
        function Sidebar() {
            const linkClass = (view) => \`block px-4 py-2 rounded hover:bg-amber-800 \${state.view === view ? 'bg-amber-900' : ''}\`;
            
            return \`
                <div class="w-full md:w-64 bg-amber-800 text-amber-100 p-4 flex-shrink-0">
                    <h1 class="text-xl font-bold mb-6">🚛 Pringles Co.</h1>
                    <nav class="space-y-2">
                        <a href="#dashboard" class="\${linkClass('dashboard')}">📊 \${getText('title')}</a>
                        <a href="#timer" class="\${linkClass('timer')}">⏱️ \${getText('timer')}</a>
                    </nav>
                    <div class="mt-8 pt-4 border-t border-amber-700">
                        <p class="text-xs opacity-50 mb-2">Language / Kieli / Sprache</p>
                        <div class="flex gap-2">
                            <button onclick="setLang('en')" class="px-2 py-1 bg-amber-700 rounded text-xs \${state.lang === 'en' ? 'ring-2 ring-white' : ''}">🇬🇧</button>
                            <button onclick="setLang('de')" class="px-2 py-1 bg-amber-700 rounded text-xs \${state.lang === 'de' ? 'ring-2 ring-white' : ''}">🇩🇪</button>
                            <button onclick="setLang('fi')" class="px-2 py-1 bg-amber-700 rounded text-xs \${state.lang === 'fi' ? 'ring-2 ring-white' : ''}">🇫🇮</button>
                        </div>
                    </div>
                </div>
            \`;
        }

        function DashboardView() {
            return \`
                <div class="p-8">
                    <h2 class="text-3xl font-bold mb-4">\${getText('welcome')}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white p-6 rounded-lg shadow border border-amber-200">
                            <h3 class="font-bold text-gray-500">Today</h3>
                            <p class="text-2xl">4h 20m</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow border border-amber-200">
                            <h3 class="font-bold text-gray-500">Deliveries</h3>
                            <p class="text-2xl">12</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow border border-amber-200">
                            <h3 class="font-bold text-gray-500">Naps Taken</h3>
                            <p class="text-2xl">Too few</p>
                        </div>
                    </div>
                </div>
            \`;
        }

        function TimerView() {
            const btnClass = state.timer.running 
                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                : "bg-green-600 hover:bg-green-700 text-white";
            
            return \`
                <div class="p-8 flex flex-col items-center justify-center w-full">
                    <div class="bg-white p-10 rounded-2xl shadow-lg border-2 border-amber-200 text-center max-w-md w-full">
                        <div class="w-32 h-32 bg-amber-100 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl overflow-hidden border-4 border-amber-300">
                            🐱
                        </div>
                        <h2 class="text-2xl font-bold mb-2 text-amber-900">\${getText('timer')}</h2>
                        <div id="timer-display" class="text-6xl font-mono font-bold text-amber-800 my-8">
                            \${formatTime(state.timer.elapsed)}
                        </div>
                        <button onclick="toggleTimer()" class="\${btnClass} px-8 py-4 rounded-full text-xl font-bold w-full transition-colors shadow-md">
                            \${state.timer.running ? '⏸️ ' + getText('pause') : '▶️ ' + getText('start')}
                        </button>
                    </div>
                </div>
            \`;
        }

        // --- MAIN RENDER LOOP ---
        function render() {
            const app = document.getElementById('app');
            let content = '';

            // 1. Sidebar
            content += Sidebar();

            // 2. Main Content
            content += '<main class="flex-1 bg-amber-50">';
            if (state.view === 'dashboard') {
                content += DashboardView();
            } else if (state.view === 'timer') {
                content += TimerView();
            } else {
                content += \`<div class="p-8">404 - Cat not found</div>\`;
            }
            content += '</main>';

            app.innerHTML = content;
        }

        window.addEventListener('hashchange', () => {
            state.view = window.location.hash.slice(1) || 'dashboard';
            render();
        });

        render();
    </script>
</body>
</html>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="p-8 bg-amber-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-6 w-6 text-amber-900" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-amber-900">Challenge 1: Reference Solution</h1>
                </div>
                <Button onClick={copyToClipboard} className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Copy className="mr-2 h-4 w-4" /> Copy Code
                </Button>
            </div>
            <p className="mb-4 text-amber-800">
                Here is the reference <code>index.html</code> for the "Raw Fish" challenge. 
                Copy it, save it, and open it in your browser!
            </p>
            <pre className="bg-slate-900 text-slate-50 p-6 rounded-lg overflow-auto h-[70vh] text-xs sm:text-sm font-mono whitespace-pre shadow-xl border border-amber-900/20">
                {code}
            </pre>
        </div>
    </div>
  );
}