# Bloom & Joy

Internetowy sklep z kwiatami i prezentami. Projekt zawiera frontend React, lokalne API Node.js oraz bazę SQLite.

## Uruchomienie lokalne

Wymagany jest Node.js 24 lub nowszy.

1. Zainstaluj zależności poleceniem `npm install`.
2. W głównym folderze projektu utwórz plik `.env` i dodaj:

   ```env
   BLOOM_ADMIN_EMAIL=admin@bloom-joy.local
   BLOOM_ADMIN_PASSWORD=ustaw-wlasne-haslo-minimum-8-znakow
   ```

3. Otwórz terminal w folderze projektu i uruchom API: `npm run api`.
4. W drugim terminalu uruchom stronę: `npm run dev`.
5. Otwórz lokalny adres podany przez Vite, zaloguj się kontem administratora i przejdź do panelu.

API tworzy bazę `data/bloom-joy.sqlite` i przy pierwszym uruchomieniu dodaje do niej początkowe produkty. Dane logowania należy przechowywać w `.env`, a sam plik nie należy przesyłać do publicznego repozytorium.

## Panel administratora

Panel jest dostępny po zalogowaniu kontem z rolą administratora. W zakładce **Zamówienia** można szukać zamówień, filtrować je według statusu i okresu, sprawdzać podsumowanie oraz zmieniać ich status. W zakładce **Produkty** można dodawać produkty, edytować nazwę, kategorię, cenę, zdjęcie, opis i stan magazynowy oraz ukrywać i ponownie publikować pozycje.

Stan magazynowy zmniejsza się po złożeniu zamówienia. Anulowanie zamówienia zwraca produkty do magazynu. Ukryty produkt znika z katalogu i nie można złożyć na niego nowego zamówienia. Wcześniejsze zamówienia pozostają zapisane w bazie.

Zalogowany klient może zobaczyć historię zamówień na stronie konta. Zamówienia złożone bez zalogowania nie są automatycznie przypisywane do konta.

## Asortyment

Początkowy katalog zawiera 29 produktów: bukiety kwiatowe, balony, upominki oraz 7 jadalnych bukietów dla niego. Osobny dział **Bukiety dla niej** prezentuje kompozycje kwiatowe z katalogu. Kreator własnego bukietu udostępnia 13 rodzajów kwiatów i 11 wariantów opakowania. Zdjęcia dwóch bukietów mięsnych pochodzą z materiałów przekazanych do projektu.

Katalog obsługuje wyszukiwanie, filtrowanie po kategorii i maksymalnej cenie oraz sortowanie. Karta produktu zawiera opis, stan magazynowy i opinie klientów. Lista ulubionych jest zapisywana w przeglądarce. Przy zamówieniu można wybrać termin dostawy i styl bileciku.

Strony **O nas** i **Kontakt** są dostępne z menu i stopki. Formularz kontaktowy zapisuje wiadomości w SQLite; administrator może je przeglądać w panelu. Podsumowanie administratora pokazuje sprzedaż, popularne produkty i niskie stany magazynowe.

## GitHub Pages

GitHub Pages udostępnia statyczną wersję katalogu. Konta, produkty administracyjne, zamówienia, opinie, kontakt i statystyki wymagają wdrożonego API z trwałą bazą danych. Po wdrożeniu API należy ustawić sekret repozytorium `VITE_API_URL` na jego publiczny adres i dodać adres strony do `BLOOM_CORS_ORIGINS` po stronie API. Ulubione produkty są zapisywane w przeglądarce.
