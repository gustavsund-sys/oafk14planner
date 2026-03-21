"""
Test suite for Player CRUD API endpoints
Tests: GET /api/players, POST /api/players, PUT /api/players/{id}, DELETE /api/players/{id}
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPlayerCRUD:
    """Player CRUD endpoint tests"""
    
    def test_get_all_players(self):
        """GET /api/players - should return all players from database"""
        response = requests.get(f"{BASE_URL}/api/players")
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one player (seeded data)"
        
        # Validate player structure
        player = data[0]
        assert "id" in player, "Player should have id"
        assert "name" in player, "Player should have name"
        assert "number" in player, "Player should have number"
        assert "image" in player, "Player should have image"
        
        print(f"SUCCESS: GET /api/players returned {len(data)} players")
    
    def test_create_player_and_verify_persistence(self):
        """POST /api/players - should add new player to database"""
        # CREATE - Post new player
        create_payload = {
            "name": "TEST_New Player",
            "number": 99,
            "image": None
        }
        create_response = requests.post(
            f"{BASE_URL}/api/players",
            json=create_payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Status assertion
        assert create_response.status_code == 200, f"Expected 200, got {create_response.status_code}: {create_response.text}"
        
        # Data assertions on create response
        created_player = create_response.json()
        assert created_player["name"] == create_payload["name"], "Name should match"
        assert created_player["number"] == create_payload["number"], "Number should match"
        assert "id" in created_player, "Should have generated ID"
        assert "image" in created_player, "Should have image (auto-generated)"
        
        player_id = created_player["id"]
        print(f"SUCCESS: POST /api/players created player with id={player_id}")
        
        # GET to verify data was actually persisted in database
        get_response = requests.get(f"{BASE_URL}/api/players")
        assert get_response.status_code == 200
        
        players = get_response.json()
        found_player = next((p for p in players if p["id"] == player_id), None)
        assert found_player is not None, "Created player should exist in database"
        assert found_player["name"] == create_payload["name"], "Persisted name should match"
        
        print(f"SUCCESS: Verified player {player_id} persisted in database")
        
        # Cleanup - delete the test player
        requests.delete(f"{BASE_URL}/api/players/{player_id}")
    
    def test_update_player_and_verify_persistence(self):
        """PUT /api/players/{id} - should update existing player"""
        # First CREATE a test player
        create_response = requests.post(
            f"{BASE_URL}/api/players",
            json={"name": "TEST_Update Player", "number": 88},
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        player_id = create_response.json()["id"]
        
        # UPDATE the player
        update_payload = {"name": "TEST_Updated Name", "number": 77}
        update_response = requests.put(
            f"{BASE_URL}/api/players/{player_id}",
            json=update_payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Status assertion
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        
        # Data assertion on update response
        updated_player = update_response.json()
        assert updated_player["name"] == "TEST_Updated Name", "Name should be updated"
        assert updated_player["number"] == 77, "Number should be updated"
        
        print(f"SUCCESS: PUT /api/players/{player_id} updated player")
        
        # GET to verify update was persisted in database
        get_response = requests.get(f"{BASE_URL}/api/players")
        assert get_response.status_code == 200
        
        players = get_response.json()
        found_player = next((p for p in players if p["id"] == player_id), None)
        assert found_player is not None, "Updated player should exist"
        assert found_player["name"] == "TEST_Updated Name", "Persisted name should be updated"
        assert found_player["number"] == 77, "Persisted number should be updated"
        
        print(f"SUCCESS: Verified player {player_id} update persisted in database")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/players/{player_id}")
    
    def test_delete_player_and_verify_removal(self):
        """DELETE /api/players/{id} - should delete player from database"""
        # First CREATE a test player
        create_response = requests.post(
            f"{BASE_URL}/api/players",
            json={"name": "TEST_Delete Player", "number": 66},
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        player_id = create_response.json()["id"]
        
        # DELETE the player
        delete_response = requests.delete(f"{BASE_URL}/api/players/{player_id}")
        
        # Status assertion
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        # Data assertion
        delete_data = delete_response.json()
        assert "message" in delete_data, "Should have message"
        assert delete_data["message"] == "Player deleted", "Should confirm deletion"
        
        print(f"SUCCESS: DELETE /api/players/{player_id} deleted player")
        
        # GET to verify player no longer exists in database
        get_response = requests.get(f"{BASE_URL}/api/players")
        assert get_response.status_code == 200
        
        players = get_response.json()
        found_player = next((p for p in players if p["id"] == player_id), None)
        assert found_player is None, "Deleted player should not exist in database"
        
        print(f"SUCCESS: Verified player {player_id} removed from database")
    
    def test_update_nonexistent_player(self):
        """PUT /api/players/{id} - should return 404 for non-existent player"""
        response = requests.put(
            f"{BASE_URL}/api/players/99999",
            json={"name": "Ghost Player"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: PUT /api/players/99999 returned 404 for non-existent player")
    
    def test_delete_nonexistent_player(self):
        """DELETE /api/players/{id} - should return 404 for non-existent player"""
        response = requests.delete(f"{BASE_URL}/api/players/99999")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: DELETE /api/players/99999 returned 404 for non-existent player")
    
    def test_update_with_empty_data(self):
        """PUT /api/players/{id} - should return 400 when no data provided"""
        # First get an existing player
        get_response = requests.get(f"{BASE_URL}/api/players")
        players = get_response.json()
        if players:
            player_id = players[0]["id"]
            
            response = requests.put(
                f"{BASE_URL}/api/players/{player_id}",
                json={},
                headers={"Content-Type": "application/json"}
            )
            
            assert response.status_code == 400, f"Expected 400, got {response.status_code}"
            print("SUCCESS: PUT with empty data returned 400")


class TestSquadEndpoints:
    """Squad sharing endpoint tests"""
    
    def test_share_squad(self):
        """POST /api/squads/share - should create shareable code"""
        payload = {
            "name": "TEST_Squad",
            "playersOnPitch": [{"player": {"id": 1, "name": "Test"}, "x": 50, "y": 50}],
            "playersOnSubs": [],
            "matchInfo": {"opponent": "Test Team", "date": "2026-01-15"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/squads/share",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "code" in data, "Should have code"
        assert data["code"].startswith("OSTRA-"), "Code should start with OSTRA-"
        assert "name" in data, "Should have name"
        
        print(f"SUCCESS: POST /api/squads/share created code: {data['code']}")
        return data["code"]
    
    def test_get_squad_by_code(self):
        """GET /api/squads/{code} - should retrieve shared squad"""
        # First create a squad
        create_response = requests.post(
            f"{BASE_URL}/api/squads/share",
            json={"name": "TEST_Retrieve Squad", "playersOnPitch": [], "playersOnSubs": []},
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        code = create_response.json()["code"]
        
        # Get the squad
        get_response = requests.get(f"{BASE_URL}/api/squads/{code}")
        
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}"
        
        data = get_response.json()
        assert data["code"] == code, "Code should match"
        assert data["name"] == "TEST_Retrieve Squad", "Name should match"
        
        print(f"SUCCESS: GET /api/squads/{code} retrieved squad")
    
    def test_get_nonexistent_squad(self):
        """GET /api/squads/{code} - should return 404 for non-existent code"""
        response = requests.get(f"{BASE_URL}/api/squads/OSTRA-ZZZZ")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: GET /api/squads/OSTRA-ZZZZ returned 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
