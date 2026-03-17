"""Тесты API мастерских (workshops)."""

import pytest


def test_list_workshops_public_without_auth(client, db):
    """Публичный список мастерских — без авторизации (для формы регистрации)."""
    r = client.get("/workshops/public")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "id" in data[0]
    assert "name" in data[0]
    assert "city" in data[0]


def test_list_workshops_admin(client, admin_token):
    """Список мастерских — с авторизацией (admin)."""
    r = client.get("/workshops/", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # В conftest создаётся одна мастерская через модель, но через API её нет — список может быть пуст или с данными из db
    # В нашем conftest мы создаём Workshop в db напрямую, так что через API список вернёт минимум 1 (тестовую)
    # Но подождите - GET /workshops/ возвращает из БД, а в db у нас есть один Workshop. Значит в списке будет 1.
    assert len(data) >= 1
    assert "id" in data[0]
    assert "name" in data[0]
    assert "city" in data[0]


def test_list_workshops_forbidden_without_auth(client):
    """Без токена — 401."""
    r = client.get("/workshops/")
    assert r.status_code == 401


def test_create_workshop_admin(client, admin_token):
    """Создание мастерской — только admin."""
    r = client.post(
        "/workshops/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Казань — Центр", "city": "Казань"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Казань — Центр"
    assert data["city"] == "Казань"
    assert "id" in data


def test_patch_and_delete_workshop_admin(client, admin_token):
    """Редактирование и удаление мастерской — admin."""
    create = client.post(
        "/workshops/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Удаляемая", "city": "Город"},
    )
    assert create.status_code == 200
    wid = create.json()["id"]
    patch = client.patch(
        f"/workshops/{wid}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Обновлённая", "city": "Другой"},
    )
    assert patch.status_code == 200
    assert patch.json()["name"] == "Обновлённая"
    delete = client.delete(f"/workshops/{wid}", headers={"Authorization": f"Bearer {admin_token}"})
    assert delete.status_code == 200
    get_after = client.get("/workshops/", headers={"Authorization": f"Bearer {admin_token}"})
    ids = [w["id"] for w in get_after.json()]
    assert wid not in ids
