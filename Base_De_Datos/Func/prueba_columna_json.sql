-- select * from prueba_json;
-- insert into prueba_json (prj_json) values('{"telegram":"11111","correo":"-----@siguetusenda.com"}');
-- select * from ver_prueba_json();
-- select * from logs;
-- insert into mensajes_sin_enviar (mse_prj_cod, mse_lg_id_logs, mse_sin_enviar) values (2, 14, '{telegram,correo}');
-- select * from mensajes_sin_enviar;
select * from registra_mensajes_no_enviados('[{"usu_mensaje_cod":"2","log_cod":"16", "sin_enviar":"{telegram,correo}"}]'::jsonb);

--select * from mensajes_sin_enviar;
