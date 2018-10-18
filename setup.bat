@echo off
@echo @echo off> policz-znaki.bat
@echo node %cd%\index.js>> policz-znaki.bat
@echo pause>> policz-znaki.bat


@echo @echo off> aktualizacja.bat
@echo cd %cd%>> aktualizacja.bat
@echo git pull>> aktualizacja.bat
@echo pause>> aktualizacja.bat

echo Gotowe, stworzono plik "policz-znaki" (jest w folderze %cd%).
echo Przenies go do folderu z plikiem do policzenia i odpal.
echo.
echo.

pause