import { Fragment, useEffect, useState } from "react";
import "./App.css";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Button,
  FormGroup,
  FormControl,
  FormControlLabel,
  InputLabel,
  OutlinedInput,
  ListItemText,
  Typography,
  MenuList,
  Paper,
  Grid,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { database } from "./firebaseConfig";
import { onValue, ref, child, get, set } from "firebase/database";

function App() {
  const matches = useMediaQuery("(max-width:500px)");

  const dbRef = ref(database);

  const [allSectors, setAllSectors] = useState([]);

  const [selectedSectors, setSelectedSectors] = useState([]);
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);

  const [open, setOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});

  useEffect(() => {
    get(child(dbRef, `/sectors`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setAllSectors(snapshot.val());
        } else {
          setAlertMsg({ type: "warning", msg: "No data available" });
          setOpen(true);
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleChange = (event, selectedSector) => {
    const {
      target: { checked },
    } = event;

    const updatedSelectedSectors = [...selectedSectors];

    const selectChildren = (children) => {
      children.forEach((child) => {
        if (!updatedSelectedSectors.includes(child.id)) {
          updatedSelectedSectors.push(child.id);
        }
        if (child.children) {
          selectChildren(child.children);
        }
      });
    };

    const deselectChildren = (children) => {
      children.forEach((child) => {
        const childIndex = updatedSelectedSectors.indexOf(child.id);
        if (childIndex !== -1) {
          updatedSelectedSectors.splice(childIndex, 1);
        }
        if (child.children) {
          deselectChildren(child.children);
        }
      });
    };

    if (checked) {
      updatedSelectedSectors.push(selectedSector.id);
      if (selectedSector.children) {
        selectChildren(selectedSector.children);
      }
    } else {
      const index = updatedSelectedSectors.indexOf(selectedSector.id);
      if (index !== -1) {
        updatedSelectedSectors.splice(index, 1);
      }
      if (selectedSector.children) {
        deselectChildren(selectedSector.children);
      }
    }

    setSelectedSectors(updatedSelectedSectors);
  };

  const renderSectors = (sectors) =>
    sectors?.map((sector) => (
      <div key={sector.id}>
        <MenuItem value={sector.id}>
          <Checkbox
            checked={selectedSectors.indexOf(sector.id) > -1}
            onChange={(e) => handleChange(e, sector)}
          />
          <ListItemText
            primary={
              <span style={{ paddingLeft: `${(sector.level || 0) * 20}px` }}>
                {sector.label}
              </span>
            }
          />
        </MenuItem>
        {sector.children && sector.children.length > 0 && (
          <MenuList style={{ paddingLeft: "7%" }}>
            {renderSectors(sector.children)}
          </MenuList>
        )}
      </div>
    ));

  const SubmitForm = () => {
    if (!name || selectedSectors.length === 0 || !agree) {
      setAlertMsg({
        type: "warning",
        msg: "Please fill all the fields!",
      });
      setOpen(true);
    } else {
      get(child(dbRef, `/usersData/${name}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            //edit data
            setAlertMsg({
              type: "success",
              msg: "Form submitted successfully!. Data updated!",
            });
          } else {
            //enter new data
            setAlertMsg({
              type: "success",
              msg: "Form submitted successfully!. New Data entered!",
            });
          }

          set(ref(database, "usersData/" + name), {
            name,
            sectors: selectedSectors?.map((id) => {
              const findSector = (sectorsArr) => {
                for (const sector of sectorsArr) {
                  if (sector.id === id) {
                    return sector.label;
                  }
                  if (sector.children) {
                    const childLabel = findSector(sector.children);
                    if (childLabel) {
                      return childLabel;
                    }
                  }
                }
                return "";
              };

              return findSector(allSectors);
            }),
            agree,
          })
            .then((e) => {
              setOpen(true);
            })
            .catch((e) => {
              alert("ERROR", e);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <Fragment>
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "80px",
        }}
      >
        <Typography
          variant="h4"
          component="h4"
          sx={{
            fontWeight: 600,
            marginBottom: "5%",
            textAlign: "center",
            margin: "2%",
            // width: "50%",
          }}
        >
          Please enter your name and pick the sectors you are currently involved
          in.
        </Typography>
        <Paper
          elevation={3}
          sx={{
            padding: "2%",
            width: matches ? "75%" : "40%",
            borderRadius: "10px",
          }}
        >
          <FormGroup>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="sector-label">Sectors</InputLabel>
                  <Select
                    labelId="sector-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={selectedSectors}
                    onChange={(e) => handleChange(e, {})}
                    input={<OutlinedInput label="Sectors" />}
                    renderValue={(selected) =>
                      selected
                        .map((id) => {
                          const findSector = (sectorsArr) => {
                            for (const sector of sectorsArr) {
                              if (sector.id === id) {
                                return sector.label;
                              }
                              if (sector.children) {
                                const childLabel = findSector(sector.children);
                                if (childLabel) {
                                  return childLabel;
                                }
                              }
                            }
                            return "";
                          };

                          return findSector(allSectors);
                        })
                        .join(", ")
                    }
                  >
                    {renderSectors(allSectors)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                  }
                  label="Agree to terms"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={() => SubmitForm()}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </FormGroup>
        </Paper>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setOpen(false)}
          severity={alertMsg?.type}
          sx={{ width: "100%" }}
        >
          {alertMsg?.msg}
        </Alert>
      </Snackbar>
    </Fragment>
  );
}

export default App;
