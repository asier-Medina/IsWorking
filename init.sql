CREATE TABLE IF NOT EXISTS public.users
(
    id_user serial NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(300) NOT NULL,
    email character varying(50) NOT NULL,
    PRIMARY KEY (id_user)
);