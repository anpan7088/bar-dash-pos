

# Registracija uporabnice Bojana

## Kaj bom naredil

1. **Ustvaril uporabniški račun** v sistemu z naslednjimi podatki:
   - Ime: **Bojana**
   - E-pošta: potrebujem e-poštni naslov (Supabase zahteva e-pošto za registracijo)
   - Geslo: **bojana01**
   - PIN: **0110**

2. **Odobril profil** — nastavil `approved = true`, da se Bojana prikaže na PIN prijavnem zaslonu

## Manjkajoč podatek

Za registracijo potrebujem **e-poštni naslov**. Lahko uporabim npr. `bojana@cafepos.si` ali drug naslov, ki ga določiš.

## Tehnični koraki

- Uporabim Supabase edge function ali exec za klic `supabase.auth.admin.createUser()` s podatki
- Trigger `handle_new_user` bo avtomatsko ustvaril profil v tabeli `profiles`
- Nato z insert toolom nastavim `approved = true` za ta profil

