@ECHO OFF
mode con: cols=150 lines=10000
color 0B
NODE "%~dp0\bot\master.js"
PAUSE