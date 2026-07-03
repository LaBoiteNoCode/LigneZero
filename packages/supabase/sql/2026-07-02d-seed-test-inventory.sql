-- LigneZero — objets de test dans l'inventaire de paul21fe@gmail.com
-- Purement pour vérifier l'affichage de la page /compte. Supprimable ensuite
-- avec : delete from inventory_items where source = 'manuel-test';

insert into inventory_items (owner_id, kind, name, description, source)
select id, 'ticket', 'Pass LAN Finals', 'Accès VIP à la finale de saison.', 'manuel-test'
from auth.users where email = 'paul21fe@gmail.com'
union all
select id, 'cartouche', 'Édition collector VALORANT', 'Cartouche numérotée, drop communauté.', 'manuel-test'
from auth.users where email = 'paul21fe@gmail.com'
union all
select id, 'special', 'Trophée MVP — saison 1', 'Objet unique, non échangeable.', 'manuel-test'
from auth.users where email = 'paul21fe@gmail.com';
